export type ConfigUiHint = {
  label?: string;
  help?: string;
  tags?: string[];
  group?: string;
  order?: number;
  advanced?: boolean;
  sensitive?: boolean;
  placeholder?: string;
  itemTemplate?: unknown;
  /** Force segmented button rendering even when the option count exceeds the default threshold. */
  forceSegmented?: boolean;
};

export type ConfigUiHints = Record<string, ConfigUiHint>;
