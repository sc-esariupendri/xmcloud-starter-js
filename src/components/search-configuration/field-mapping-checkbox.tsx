import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContentField } from "./types";

interface FieldMappingCheckboxProps {
  fieldName: string;
  checked: boolean;
  mappingValue: string;
  availableFields: ContentField[];
  onCheckedChange: (checked: boolean) => void;
  onMappingChange: (value: string) => void;
}

export function FieldMappingCheckbox({
  fieldName,
  checked,
  mappingValue,
  availableFields,
  onCheckedChange,
  onMappingChange,
}: FieldMappingCheckboxProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id={fieldName}
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
        <label
          htmlFor={fieldName}
          className="text-sm cursor-pointer select-none leading-none"
        >
          {fieldName}
        </label>
      </div>
      <Select
        value={!mappingValue ? undefined : mappingValue}
        onValueChange={onMappingChange}
        disabled={!checked}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select mappings" />
        </SelectTrigger>
        <SelectContent>
          {availableFields.map((field) => (
            <SelectItem key={field.id} value={field.id}>
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

