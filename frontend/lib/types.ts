export type DetectedBy = "word_style" | "heuristic" | "user";
export type BlockKind = "paragraph" | "table" | "image" | "field";

export interface Block {
  id: string;
  kind: BlockKind;
  level: number;
  text?: string | null;
  detected_by?: DetectedBy | null;
  markdown?: string | null;
  preview_url?: string | null;
  caption?: string | null;
  raw_ref?: string | null;
  field_kind?: string | null;
  preview_text?: string | null;
}

export interface Outline {
  job_id: string;
  source_filename: string;
  blocks: Block[];
}

export interface Template {
  id: string;
  name: string;
  is_builtin: boolean;
  spec: Record<string, unknown>;
}

export interface JobSummary {
  id: string;
  original_filename: string;
  status: string;
  created_at: string;
}
