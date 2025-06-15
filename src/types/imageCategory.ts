
export interface ImageCategory {
  id: string;
  name: string;
  parentId?: string;
  subcategories?: ImageCategory[];
  type: 'image';
  created_at?: string;
}
