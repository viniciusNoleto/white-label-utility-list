export interface IListRecord {
  id: number;
  values: Record<string, any>;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}
