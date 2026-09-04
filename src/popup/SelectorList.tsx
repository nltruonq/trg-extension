import { X } from "lucide-react";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";

interface SelectorListProps {
  items: string[];
  emptyLabel: string;
  onRemove: (selector: string) => void;
}

export function SelectorList({ items, emptyLabel, onRemove }: SelectorListProps) {
  return (
    <ScrollArea className="h-[176px] p-2">
      {items.length === 0 ? (
        <p className="px-1 py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((selector) => (
            <li
              key={selector}
              className="flex items-start gap-2 rounded-md bg-muted/40 px-3 py-2"
            >
              <p className="w-0 flex-grow whitespace-pre-wrap break-words text-sm text-muted-foreground">
                {selector}
              </p>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Xoá ${selector}`}
                onClick={() => onRemove(selector)}
                className="h-6 w-6 shrink-0 text-red-500 hover:text-red-600"
              >
                <X size={14} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </ScrollArea>
  );
}
