import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface CardGridSkeletonProps {
  count?: number;
}

export function CardGridSkeleton({ count = 6 }: Readonly<CardGridSkeletonProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton, index is stable
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
