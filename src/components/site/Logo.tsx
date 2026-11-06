import Image from 'next/image';
import Link from 'next/link';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="MIC TECH home">
      <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-[#25262a] shadow-[0_0_26px_-14px_rgba(201,247,74,0.8)] transition duration-300 group-hover:border-signal/35">
        <Image
          src="/brand/mic-tech-mark.webp"
          alt=""
          width={317}
          height={360}
          priority
          className="size-full object-contain"
        />
      </span>
      <span className="leading-none">
        <span className="font-display text-[1.05rem] font-semibold tracking-[0.16em] text-paper transition-colors group-hover:text-signal">
          MIC TECH
        </span>
        {!compact && (
          <span className="mt-1 block text-[0.58rem] font-medium uppercase tracking-[0.22em] text-muted-2">
            Hello evolution
          </span>
        )}
      </span>
    </Link>
  );
}
