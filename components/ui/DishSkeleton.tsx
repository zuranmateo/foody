"use client"

import { Skeleton } from "./skeleton"

export function DishSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border bg-card shadow-sm animate-pulse">
      <div className="flex items-start gap-4">
        <Skeleton className="h-20 w-20 rounded-md flex-shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

