export default function SiteLoading() {
  return (
    <div className="container-page animate-pulse py-10">
      <div className="h-3 w-28 rounded bg-white/10" />
      <div className="mt-4 h-12 w-3/4 rounded bg-white/10" />
      <div className="mt-3 h-4 w-1/2 rounded bg-white/5" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-xl border border-line bg-panel">
            <div className="aspect-[16/10] bg-white/5" />
            <div className="space-y-3 p-4">
              <div className="h-2.5 w-16 rounded bg-white/10" />
              <div className="h-4 w-full rounded bg-white/10" />
              <div className="h-4 w-4/5 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
