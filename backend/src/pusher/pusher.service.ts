import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Pusher from 'pusher';

@Injectable()
export class PusherService implements OnModuleInit {
  private pusher: Pusher;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.pusher = new Pusher({
      appId: this.configService.get<string>('pusher.appId')!,
      key: this.configService.get<string>('pusher.key')!,
      secret: this.configService.get<string>('pusher.secret')!,
      cluster: this.configService.get<string>('pusher.cluster')!,
      useTLS: true,
    });
  }

  async trigger(channel: string, event: string, data: any): Promise<void> {
    await this.pusher.trigger(channel, event, data);
  }

  poolChannel(poolId: string): string {
    return `pool-${poolId}`;
  }
}
