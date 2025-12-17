import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { mdiChevronUp, mdiChevronDown } from "@mdi/js";
import { Icon } from "@/lib/icon";

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-gray-50 dark:bg-gray-800/30 rounded-md p-3"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium mb-3">
        <span>{title}</span>
        <Icon
          path={isOpen ? mdiChevronUp : mdiChevronDown}
          size={0.7}
          className="text-gray-600 dark:text-gray-400"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2.5">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
