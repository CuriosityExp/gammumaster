import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: Readonly<TableSkeletonProps>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton, index is stable
              <TableHead key={i}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton, index is stable
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }, (_, colIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton, index is stable
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
