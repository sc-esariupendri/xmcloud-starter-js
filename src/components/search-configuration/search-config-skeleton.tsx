import { Skeleton } from "@/components/ui/skeleton";

export function SearchConfigSkeleton() {
  return (
    <div className="w-full space-y-3">
      {/* Search Index Select Skeleton */}
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-md p-2">
        <div className="flex gap-3 items-center">
          <div className="flex-shrink-0">
            <Skeleton className="w-[35px] h-[35px] rounded-md" />
          </div>
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
      </div>

      {/* Show Content Section Skeleton */}
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-md p-2">
        <div className="flex gap-3 items-start">
          <div className="flex-shrink-0">
            <Skeleton className="w-[35px] h-[35px] rounded-md" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-36" />
            </div>
            
            {/* Checkbox Items - 3 content fields (tags, images, descriptions) */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

