import { cn } from "@/lib/cn";

interface TableColumnsProps {
  className?: string;
}

/** The one table's column headings, while it lies at rest. */
export function TableColumns({ className }: TableColumnsProps) {
  return (
    <p className={cn("m-0 flex justify-between text-muted", className)}>
      <span>session</span>
      <span>organisation_id</span>
    </p>
  );
}
