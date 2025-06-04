export interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}
