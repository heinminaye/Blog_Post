export interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface DeleteResult {
  public_id: string;
  success: boolean;
  error?: string;
}