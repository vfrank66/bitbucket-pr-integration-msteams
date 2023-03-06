import { HttpModule, Module } from '@nestjs/common';

import { TeamsIncomingHookService } from './teams-incoming-hook.service';
import { HookController } from './hook.controller';

@Module({
  imports: [HttpModule],
  controllers: [HookController],
  providers: [TeamsIncomingHookService],
})
export class AppModule {}
