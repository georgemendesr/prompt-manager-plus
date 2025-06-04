export type RawCategory = {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
};

export interface CategoryRecord {
  id: string;
  name: string;
  parent_id: string | null;
  created_at?: string;
}