export type Notification = {
  id: string;
  created_at: string;
  user_id: string | null; // null = broadcast a todas las instituciones
  donation_id: number;
  message: string;
  read: boolean;
};

export type NotificationWithReadStatus = Notification & {
  is_read: boolean; // resolved: read column (directed) | notification_reads presence (broadcast)
};
