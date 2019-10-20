import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from './services/users.service';
import { BoardsService } from './services/boards.service';
import { Logger } from '@nestjs/common';
import { MsgToServer } from 'src/interfaces/events.gateway.interface';
import { Status, User } from 'src/interfaces/users.interface';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly usersService: UsersService,
    private readonly boardsService: BoardsService
  ) {}

  private logger: Logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const users = await this.usersService.deleteUser(client.id);
    const payload = {
      event: this.handleDisconnect.name,
      users,
    };
    this.server.emit('refreshOnlineUsers', payload);
  }

  @SubscribeMessage('createUser')
  async createUser(client: Socket, name: string) {
    this.logger.log(`Event: CreateUser => Name: ${name}`);
    const user: User = {
      id: client.id,
      name,
      oppId: '',
      status: Status.ONLINE,
      mmr: 0,
      ready: false,
      score: 0,
    };
    try {
      const users = await this.usersService.addUser(user);
      const payload1 = {
        event: this.createUser.name,
        users,
      };
      this.server.emit('refreshOnlineUsers', payload1);
      const payload2 = {
        event: this.createUser.name,
        user: users[client.id],
      };
      client.emit('returnUpdatedUser', payload2);
      await this.boardsService.initBoard(client.id);
    } catch (err) {
      return { message: err.message };
    }
  }

  @SubscribeMessage('updateUser')
  async updateUser(client: Socket, updatedUser: User) {
    this.logger.log(`Event: UpdateUser => UpdatedUser: ${updatedUser}`);
    const users = await this.usersService.updateUser(updatedUser);
    const payload = {
      event: this.updateUser.name,
      user: users[updatedUser.id],
    };
    client.emit('returnUpdatedUser', payload);
  }

  @SubscribeMessage('deleteUser')
  async deleteUser(client: Socket, userId: string) {
    this.logger.log(`Event: DeleteUser`);
    const payload = {
      event: this.deleteUser.name,
      users: await this.usersService.deleteUser(userId),
    };
    this.server.emit('refreshOnlineUsers', payload);
  }

  // count: number = 0;

  @SubscribeMessage('pingToServer')
  ping(client: Socket, ping: any) {
    // this.logger.log(`Event: PingToServer => count: ${++this.count}`);
    const msg = `${client.id}: Ping! ${Date().toString()}`;
    const payload = {
      event: this.ping.name,
      msg,
      // count: this.count,
    };
    client.emit('pingToClient', payload);
  }

  @SubscribeMessage('fetchUser')
  async fetchUser(client: Socket, data: any) {
    this.logger.log(`Event: FetchUser`);
    return await this.usersService.getUser(client.id);
  }

  /////////////////////////////////////////////////////////////////

  RUU = 'returnUpdatedUser';

  @SubscribeMessage('msgToServer')
  sendMessage(client: Socket, text: MsgToServer) {
    this.logger.log(`Event: MsgToServer`);
    const message = {
      name: this.usersService.users[client.id].name,
      text,
    };
    // this.logger.log(message);
    this.server.emit('msgToClients', {
      event: 'MsgToServer',
      message,
    });
  }

  @SubscribeMessage('sendInvitation')
  async invitePlayer(client: Socket, oppId: string) {
    this.logger.log(`Event: SendInvitation`);
    const prevUser = this.usersService.users[client.id];
    const updatedUser = {
      ...prevUser,
      oppId,
    };
    const users = await this.usersService.updateUser(updatedUser);
    // console.log(users[client.id]);
    client.emit('returnUpdatedUser', {
      event: 'SendInvitaion',
      user: users[client.id],
    });
    client.broadcast.to(oppId).emit('getInvitation', {
      event: 'SendInvitation',
      clientId: client.id,
    });
  }

  @SubscribeMessage('acceptInvitation')
  async moveToPreparationStage(client: Socket, oppId: string) {
    this.logger.log(`Event: AcceptInvitation`);
    // console.log('Still in here');
    // console.log(`oppId: ${oppId}, clientID: ${client.id}`);
    // console.log(this.usersService.users[oppId]);
    if (this.usersService.users[oppId].status === Status.ONLINE) {
      // console.log('In IF');
      const prevOpp = this.usersService.users[oppId];
      const updatedOpp = {
        ...prevOpp,
        status: Status.INGAME,
        oppId: client.id,
      };
      client.broadcast.to(oppId).emit('returnUpdatedUser', {
        event: 'AcceptInvitation',
        user: (await this.usersService.updateUser(updatedOpp))[oppId],
      });
      const prevUser = this.usersService.users[client.id];
      const updatedUser = {
        ...prevUser,
        status: Status.INGAME,
        oppId,
      };
      const users = await this.usersService.updateUser(updatedUser);
      client.emit('returnUpdatedUser', {
        event: 'AcceptInvitation',
        user: users[client.id],
      });
      const payload = {
        event: 'AcceptInvitation',
        users,
      };
      this.server.emit('refreshOnlineUsers', payload);
      // Emit event to both
      client.broadcast.to(oppId).emit('preparationStage', {
        event: 'AcceptInvitation',
      });
      client.emit('preparationStage', {
        event: 'AcceptInvitation',
      });
    } else {
      // console.log('In ELSE');
      return { message: `Opponent status !== ONLINE` };
    }
  }

  @SubscribeMessage('createBoard')
  async createBoard(
    client: Socket,
    payload: { shipPlacement: number[]; oppId: string }
  ) {
    this.logger.log(`Event: CreateBoard`);
    const board = await this.boardsService.placeShips(
      payload.shipPlacement,
      client.id
    );
    this.usersService.users[client.id].ready = true;
    if (
      this.usersService.users[client.id].ready &&
      this.usersService.users[payload.oppId].ready
    ) {
      // console.log('in BothReady');
      const rdm = Math.round(Math.random());
      client.emit('startGame', {
        event: 'CreateBoard',
        coin: rdm,
      });
      client.broadcast.to(payload.oppId).emit('startGame', {
        event: 'CreateBoard',
        coin: 1 - rdm,
      });
    }
    return board;
  }

  @SubscribeMessage('bothReady')
  startGame(client: Socket, oppId: string) {
    this.logger.log(`Event: BothReady`);
    const rdm = Math.round(Math.random());
    client.emit('startGame', {
      event: 'BothReady',
      coin: rdm,
    });
    client.broadcast.to(oppId).emit('startGame', {
      event: 'BothReady',
      coin: 1 - rdm,
    });
  }

  @SubscribeMessage('fetchBoard')
  async fetchBoard(client: Socket, oppId: string) {
    this.logger.log(`Event: FetchBoard`);
    const payload = {
      yourBoard: this.boardsService.boards[client.id],
      oppBoard: this.boardsService.boards[oppId],
    };
    client.emit('receiveFetchBoard', payload);
  }

  @SubscribeMessage('attackBoard')
  async attackBoard(client: Socket, payload: { index: number; oppId: string }) {
    this.logger.log(`Event: AttackBoard`);
    const board = await this.boardsService.isAttacked(
      payload.index,
      payload.oppId
    );
    client.broadcast.to(payload.oppId).emit('updateYourBoard', {
      event: 'AttackBoard',
      board,
    });
    return board;
  }
}
