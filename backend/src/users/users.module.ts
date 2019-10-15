import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersGateway } from './users.gateway';
import { BoardsService } from 'src/boards/boards.service';

@Module({
  imports: [],
  controllers: [],
  providers: [UsersGateway, UsersService, BoardsService],
})
export class UsersModule {}
