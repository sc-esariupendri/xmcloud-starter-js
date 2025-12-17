import { Checkbox } from "@/components/ui/checkbox";

interface ContentFieldCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function ContentFieldCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
}: ContentFieldCheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <label
        htmlFor={id}
        className="text-sm cursor-pointer select-none leading-none"
      >
        {label}
      </label>
    </div>
  );
}

