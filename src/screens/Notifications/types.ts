export interface NotificationItem {
  image_url: string | undefined;
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}
