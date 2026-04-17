import Pusher from 'pusher-js';
import { env } from '@/config/env';

let pusherInstance: Pusher | null = null;

export function getPusher(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(env.pusherKey, {
      cluster: env.pusherCluster,
    });
  }
  return pusherInstance;
}
