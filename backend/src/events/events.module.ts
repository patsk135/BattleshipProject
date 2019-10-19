import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { UsersService } from './services/users.service';
import { BoardsService } from './services/boards.service';

@Module({
  imports: [],
  controllers: [],
  providers: [EventsGateway, UsersService, BoardsService],
})
export class EventsModule {}
