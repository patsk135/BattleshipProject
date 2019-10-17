import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { Status, User } from '../interfaces/users.interface';
import { BoardsService } from 'src/boards/boards.service';

@WebSocketGateway()
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly usersService: UsersService,
    private readonly boardsService: BoardsService
  ) {}

  private logger: Logger = new Logger('UsersGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const users = await this.usersService.deleteUser(client.id);
    const data = {
      event: 'HandleDisconnect',
      users,
    };
    this.server.emit('refreshOnlineUsers', data);
  }

  @SubscribeMessage('createUser')
  async createUser(client: Socket, name: string) {
    this.logger.log(`Event: CreateUser => Name: ${name}`);
    const user: User = {
      id: client.id,
      name,
      oppId: '',
      status: Status.ONLINE,
      score: 0,
    };
    try {
      const users = await this.usersService.addUser(user);
      const data1 = {
        event: 'CreateUser',
        users,
      };
      this.server.emit('refreshOnlineUsers', data1);
      const data2 = {
        event: 'CreateUser',
        user: users[client.id],
      };
      client.emit('returnUpdatedUser', data2);
      await this.boardsService.initBoard(client.id);
    } catch (err) {
      return { message: err.message };
    }
  }

  @SubscribeMessage('updateUser')
  async updateUser(client: Socket, updatedUser: User) {
    this.logger.log(`Event: UpdateUser => UpdatedUser: ${updatedUser}`);
    const users = await this.usersService.updateUser(updatedUser);
    const data = {
      event: 'UpdateUser',
      user: users[updatedUser.id],
    };
    client.emit('returnUpdatedUser', data);
  }

  @SubscribeMessage('deleteUser')
  async deleteUser(client: Socket, userId: string) {
    this.logger.log(`Event: DeleteUser`);
    const data = {
      event: 'DeleteUser',
      users: await this.usersService.deleteUser(userId),
    };
    this.server.emit('refreshOnlineUsers', data);
  }

  @SubscribeMessage('pingToServer')
  ping(client: Socket, ping: any) {
    this.logger.log(`Event: PingToServer`);
    const msg = `${client.id}: Ping! ${Date().toString()}`;
    const data = {
      event: 'PingToServer',
      msg,
    };
    client.emit('pingToClient', data);
  }

  @SubscribeMessage('fetchUser')
  async fetchUser(client: Socket, data: any) {
    this.logger.log(`Event: FetchUser`);
    return await this.usersService.getUser(client.id);
  }
}
