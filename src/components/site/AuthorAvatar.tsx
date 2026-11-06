import type { Author } from '@/lib/types';
import { cn } from '@/lib/utils';

const sizes = {
  xs: 'size-6 text-[0.55rem]',
  sm: 'size-8 text-[0.62rem]',
  md: 'size-10 text-xs',
  lg: 'size-14 text-sm',
  xl: 'size-24 text-xl',
};

export function AuthorAvatar({
  author,
  size = 'sm',
  className,
}: {
  author: Pick<Author, 'name' | 'initials' | 'avatarColor'>;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full border border-white/10 bg-gradient-to-br font-display font-semibold tracking-wider',
        author.avatarColor,
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      {author.initials}
    </span>
  );
}
