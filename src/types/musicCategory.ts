export interface MusicCategory {
  id: string;
  name: string;
  parentId?: string;
  subcategories?: MusicCategory[];
  type: 'music';
  created_at?: string;
} 