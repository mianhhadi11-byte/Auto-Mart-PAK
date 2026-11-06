import Link from 'next/link';
import { Clock } from 'lucide-react';
import { getEmbedUrl } from '@/lib/utils';

export function VideoPlayer({
  url,
  poster,
  title,
  className,
}: {
  url: string;
  poster?: string;
  title: string;
  className?: string;
}) {
  const embed = getEmbedUrl(url);
  if (embed) {
    return (
      <div className={className}>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-line bg-black">
          <iframe
            src={embed}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        </div>
      </div>
    );
  }

  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url) || url.startsWith('/videos/')) {
    return (
      <div className={className}>
        <video
          controls
          playsInline
          preload="metadata"
          poster={poster}
          className="aspect-video w-full rounded-xl border border-line bg-black object-cover"
          aria-label={title}
        >
          <source src={url} type={url.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
          Your browser does not support embedded video. <a href={url}>Download the report</a>.
        </video>
        <p className="mt-2 flex items-center gap-1.5 text-[0.68rem] text-muted-2">
          <Clock className="size-3" aria-hidden="true" /> MIC TECH video report
        </p>
      </div>
    );
  }

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex aspect-video items-center justify-center rounded-xl border border-line bg-panel text-sm text-signal"
    >
      Watch the video report
    </Link>
  );
}
