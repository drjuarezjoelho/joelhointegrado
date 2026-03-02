import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen">
      <Skeleton className="w-[280px] shrink-0 rounded-none" />
      <div className="flex-1 flex flex-col">
        <Skeleton className="h-14 border-b" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
