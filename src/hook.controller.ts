import { Body, Controller, HttpCode, Post, Query } from '@nestjs/common';

import { TeamsIncomingHookService } from './teams-incoming-hook.service';

@Controller()
export class HookController {
  constructor(private readonly service: TeamsIncomingHookService) {}
  @Post()
  @HttpCode(204)
  async post(@Body() content: any, @Query('webhook') webhook: string) {
    await this.service.sendWebhook(content, webhook);
  }
}
