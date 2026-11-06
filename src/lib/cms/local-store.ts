import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { get, put } from '@vercel/blob';
import type { StoreData } from '@/lib/types';
import { buildSeedData } from './seed';

const DATA_FILE =
  process.env.MICTECH_DATA_FILE || path.join(process.cwd(), 'data', 'mictech.json');

const BLOB_PATH = process.env.MICTECH_BLOB_PATH || 'mictech/store.json';

const globalStore = globalThis as unknown as {
  __mictechStoreQueue?: Promise<unknown>;
};

function runExclusive<T>(task: () => Promise<T>): Promise<T> {
  const previous = globalStore.__mictechStoreQueue ?? Promise.resolve();
  const next = previous.then(task, task);
  globalStore.__mictechStoreQueue = next.catch(() => undefined);
  return next;
}

function blobToken() {
  return (
    process.env.DATA_BLOB_READ_WRITE_TOKEN?.trim() ||
    process.env.MICTECH_BLOB_READ_WRITE_TOKEN?.trim() ||
    ''
  );
}

function parseStore(raw: string): StoreData | null {
  try {
    const parsed = JSON.parse(raw) as StoreData;
    if (!parsed || !Array.isArray(parsed.articles) || !Array.isArray(parsed.users)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function readBlob(token: string): Promise<StoreData | null> {
  const result = await get(BLOB_PATH, { access: 'private', token, useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return parseStore(await new Response(result.stream).text());
}

async function writeBlob(data: StoreData, token: string) {
  await put(BLOB_PATH, JSON.stringify(data), {
    access: 'private',
    token,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

async function readFile(): Promise<StoreData | null> {
  const token = blobToken();
  if (token) return readBlob(token);
  try {
    const raw = await fs.readFile(/* turbopackIgnore: true */ DATA_FILE, 'utf8');
    return parseStore(raw);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return null;
    throw error;
  }
}

async function writeFile(data: StoreData) {
  const token = blobToken();
  if (token) {
    await writeBlob(data, token);
    return;
  }
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  const temp = `${DATA_FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temp, JSON.stringify(data, null, 2), 'utf8');
  try {
    await fs.rename(temp, DATA_FILE);
  } catch {
    await fs.rm(DATA_FILE, { force: true });
    await fs.rename(temp, DATA_FILE);
  }
}

async function loadOrSeed(): Promise<StoreData> {
  const existing = await readFile();
  if (existing) return existing;
  const seeded = await buildSeedData();
  await writeFile(seeded);
  return seeded;
}

export function localStorePath() {
  return blobToken() ? 'Vercel Blob (private)' : DATA_FILE;
}

export async function readStore(): Promise<StoreData> {
  return runExclusive(loadOrSeed);
}

export async function replaceStore(next: StoreData): Promise<StoreData> {
  return runExclusive(async () => {
    await writeFile(next);
    return next;
  });
}

export async function mutateStore<T>(mutator: (data: StoreData) => T | Promise<T>): Promise<T> {
  return runExclusive(async () => {
    const data = await loadOrSeed();
    const result = await mutator(data);
    await writeFile(data);
    return result;
  });
}

export async function resetStore(): Promise<StoreData> {
  return runExclusive(async () => {
    const seeded = await buildSeedData();
    await writeFile(seeded);
    return seeded;
  });
}
