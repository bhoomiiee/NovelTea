// Reusable skeleton components for loading states

export const SkeletonBox = ({ className = '' }) => (
  <div className={`animate-pulse bg-[var(--color-tea-200)] rounded-2xl ${className}`} />
);

export const BookshelfSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6 pt-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="text-center animate-pulse">
        <div className="aspect-[2/3] bg-[var(--color-tea-200)] rounded-xl mb-3.5" />
        <div className="h-3 bg-[var(--color-tea-200)] rounded-full w-4/5 mx-auto mb-1.5" />
        <div className="h-2.5 bg-[var(--color-tea-100)] rounded-full w-3/5 mx-auto" />
      </div>
    ))}
  </div>
);

export const StatCardSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-[var(--color-tea-100)] p-6 animate-pulse">
        <div className="w-8 h-8 bg-[var(--color-tea-200)] rounded-xl mb-3" />
        <div className="h-8 bg-[var(--color-tea-200)] rounded-lg w-1/2 mb-2" />
        <div className="h-3 bg-[var(--color-tea-100)] rounded-full w-3/4" />
      </div>
    ))}
  </div>
);

export const CardListSkeleton = ({ count = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-[var(--color-tea-100)] p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[var(--color-tea-200)] rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-[var(--color-tea-200)] rounded-full w-1/3" />
            <div className="h-2.5 bg-[var(--color-tea-100)] rounded-full w-1/5" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-[var(--color-tea-100)] rounded-full w-full" />
          <div className="h-3 bg-[var(--color-tea-100)] rounded-full w-5/6" />
          <div className="h-3 bg-[var(--color-tea-100)] rounded-full w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

export const WordCardSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-[var(--color-tea-100)] p-6 animate-pulse">
        <div className="flex justify-between mb-3">
          <div className="h-6 bg-[var(--color-tea-200)] rounded-lg w-1/3" />
          <div className="w-6 h-6 bg-[var(--color-tea-100)] rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-[var(--color-tea-100)] rounded-full w-full" />
          <div className="h-3 bg-[var(--color-tea-100)] rounded-full w-4/5" />
        </div>
        <div className="flex gap-2 mt-3">
          <div className="h-5 w-16 bg-[var(--color-tea-100)] rounded-full" />
          <div className="h-5 w-14 bg-[var(--color-tea-100)] rounded-full" />
        </div>
      </div>
    ))}
  </div>
);
