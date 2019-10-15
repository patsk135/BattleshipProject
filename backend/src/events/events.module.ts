import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { UsersService } from '../users/users.service';
import { BoardsService } from '../boards/boards.service';

@Module({
  imports: [],
  controllers: [],
  providers: [EventsGateway, UsersService, BoardsService],
})
export class EventsModule {}
