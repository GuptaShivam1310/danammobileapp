export type Nullable<T> = T | null;

export interface AppMeta {
  version: string;
  environment: 'development' | 'staging' | 'production';
}
