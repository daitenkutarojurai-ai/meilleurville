export default function CityLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="bg-[var(--bg-elevated)] py-12 border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-4">
          <div className="skeleton h-4 w-48" />
          <div className="skeleton h-10 w-72" />
          <div className="skeleton h-5 w-56" />
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="skeleton h-64 rounded-2xl" />
            <div className="skeleton h-80 rounded-2xl" />
          </div>
          <div className="space-y-4">
            <div className="skeleton h-48 rounded-2xl" />
            <div className="skeleton h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
