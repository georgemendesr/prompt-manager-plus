
export interface TextCategory {
  id: string;
  name: string;
  parentId?: string;
  subcategories?: TextCategory[];
  type: 'text';
  created_at?: string;
}
