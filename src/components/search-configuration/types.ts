export interface FieldOption {
  value: string;
  label: string;
}

export interface ContentField {
  id: string;
  label: string;
}

export interface SearchConfigState {
  searchIndex: string;
  fieldsMapping: Record<string, string>;
}

export interface SearchConfigurationProps {
  searchIndices?: FieldOption[];
  fieldsMap?: Record<string, ContentField[]>;
  contentFields?: ContentField[];

  // Initial state
  initialConfig?: Partial<SearchConfigState>;

  // Callbacks
  onChange?: (config: SearchConfigState) => void;

  // Container options
  className?: string;

  // API error handling
  apiError?: string | null;
  isLoading?: boolean;
}
