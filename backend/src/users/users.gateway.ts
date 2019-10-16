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
    this.server.emit('refreshOnlineUsers', this.usersService.users);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.usersService
      .deleteUser(client.id)
      .then(() => {
        this.server.emit('refreshOnlineUsers', this.usersService.users);
      })
      .catch(() => console.log('error: Not yet create user'));
  }

  @SubscribeMessage('createUser')
  async createUser(client: Socket, name: string) {
    console.log('Event: createUser');
    console.log(`Name: ${name}`);
    const user: User = {
      id: client.id,
      name,
      oppId: '',
      status: Status.ONLINE,
      score: 0,
    };
    try {
      const users = await this.usersService.addUser(user);
      this.server.emit('refreshOnlineUsers', users);
      await this.boardsService.initBoard(client.id);
      return users[client.id];
      // return client.id;
    } catch (err) {
      return { message: err.message };
    }
  }

  @SubscribeMessage('updateUser')
  async updateUser(client: Socket, updatedUser: User) {
    return await this.usersService.updateUser(updatedUser);
  }

  @SubscribeMessage('deleteUser')
  async deleteUser(client: Socket, userId: string) {
    this.server.emit(
      'refreshOnlineUsers',
      await this.usersService.deleteUser(userId)
    );
  }

  @SubscribeMessage('pingToServer')
  ping(client: Socket, data: any) {
    const msg = `${client.id}: Ping! ${Date.now()}`;
    // console.log(msg);
    client.emit('pingToClient', msg);
  }

  @SubscribeMessage('fetchUser')
  async fetchUser(client: Socket, data: any) {
    return await this.usersService.getUser(client.id);
  }
}
