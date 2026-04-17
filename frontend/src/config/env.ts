export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  pusherKey: import.meta.env.VITE_PUSHER_KEY || '',
  pusherCluster: import.meta.env.VITE_PUSHER_CLUSTER || 'ap1',
} as const;
