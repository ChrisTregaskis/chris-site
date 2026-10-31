import { Chip } from "@/ui/atoms/Chip";

export interface ChipListProps {
  items: string[];
  size?: "md" | "sm";
  /** Names the list for assistive tech, e.g. "Stack". */
  label?: string;
}

export function ChipList({ items, size = "md", label }: ChipListProps) {
  return (
    <ul
      aria-label={label}
      className="m-0 flex list-none flex-wrap gap-[6px] p-0"
    >
      {items.map((item) => (
        <Chip key={item} size={size}>
          {item}
        </Chip>
      ))}
    </ul>
  );
}
