import { mdiTextBoxSearchOutline } from "@mdi/js";
import { Icon } from "@/lib/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldOption } from "./types";
import * as React from "react";

interface SearchIndexSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: FieldOption[];
}

export function SearchIndexSelect({
  value,
  onValueChange,
  options,
}: SearchIndexSelectProps) {
  const hasOptions = options.length > 0;
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (hasOptions && containerRef.current) {
      // Find the Select trigger button within the container
      const trigger = containerRef.current.querySelector('button[data-slot="select-trigger"]') as HTMLButtonElement;
      if (trigger && e.target !== trigger && !trigger.contains(e.target as Node)) {
        trigger.click();
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="bg-gray-50 dark:bg-gray-800/30 rounded-md p-2 cursor-pointer"
      onClick={handleContainerClick}
    >
      <div className="flex gap-3 items-center">
        <div className="flex-shrink-0">
          <Icon 
            path={mdiTextBoxSearchOutline} 
            size={1.4} 
            className={hasOptions ? "text-gray-500 dark:text-gray-400" : "text-gray-400 dark:text-gray-600"}
          />
        </div>
        <div className="flex-1">
          <label className={`text-xs font-normal block ${hasOptions ? "text-gray-500 dark:text-gray-400" : "text-gray-400 dark:text-gray-600"}`}>
            Search index
          </label>
          {hasOptions ? (
            <Select value={value} onValueChange={onValueChange}>
              <SelectTrigger className="w-full border-none bg-transparent shadow-none hover:bg-transparent focus:ring-0 p-0 !h-auto text-base font-medium">
                <SelectValue placeholder="Select search index" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-base font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed">
              No indices available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

