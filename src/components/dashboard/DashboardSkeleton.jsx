'use client'

/**
 * A skeleton loader component to display while the dashboard data is being fetched.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="h-24 bg-gray-200 rounded-xl"></div>
        <div className="h-24 bg-gray-200 rounded-xl"></div>
        <div className="h-24 bg-gray-200 rounded-xl"></div>
        <div className="h-24 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Chart Skeleton */}
      <div className="h-80 bg-gray-200 rounded-xl"></div>

      {/* Table Skeleton */}
      <div className="bg-gray-200 rounded-xl p-6 space-y-4">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="space-y-2">
            <div className="h-12 bg-gray-300 rounded"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  )
}
