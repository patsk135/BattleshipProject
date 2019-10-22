import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from './services/users.service';
import { BoardsService } from './services/boards.service';
import { Logger } from '@nestjs/common';
import { MsgToServer } from '../interfaces/events.gateway.interface';
import { Status, User } from '../interfaces/users.interface';

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
    client.emit('onConnection');
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    if (
      this.usersService.users[client.id] !== undefined &&
      this.usersService.users[client.id].oppId !== ''
    ) {
      const oppId = this.usersService.users[client.id].oppId;
      if (this.usersService.users[oppId].status === Status.INGAME) {
        const updatedUser: User = {
          ...this.usersService.users[oppId],
          oppId: '',
          status: Status.ONLINE,
          ready: false,
          score: 0,
          yourTurn: false,
        };
        updatedUser.mmr = updatedUser.mmr + 1;
        this.usersService.updateUser(updatedUser);
        // const payload = {
        //   event: 'Handle Disconnection',
        //   user: updatedUser,
        // };
        // client.broadcast.to(oppId).emit('returnUpdatedUser', payload);
        client.broadcast.to(oppId).emit('finishGame', 'oppDisconnect');
      }
    }
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
      yourTurn: false,
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
      return false;
    } catch (err) {
      return { message: err.message };
    }
  }

  @SubscribeMessage('fetchUser')
  async fetchUser(client: Socket, data: any) {
    this.logger.log(`Event: FetchUser`);
    const payload = {
      event: 'FetchUser',
      user: this.usersService.users[client.id],
    };
    client.emit('returnUpdatedUser', payload);
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
  async createBoard(client: Socket, shipPlacement: number[]) {
    this.logger.log(`Event: CreateBoard`);
    const board = await this.boardsService.placeShips(shipPlacement, client.id);
    this.usersService.users[client.id].ready = true;
    if (
      this.usersService.users[client.id].ready &&
      this.usersService.users[this.usersService.users[client.id].oppId].ready
    ) {
      const payload = {
        yourBoard: board,
        oppBoard: this.boardsService.boards[
          this.usersService.users[client.id].oppId
        ],
      };
      client.emit('receiveFetchBoard', payload);
      // console.log('in BothReady');
      if (
        this.usersService.users[client.id].yourTurn ||
        this.usersService.users[this.usersService.users[client.id].oppId]
          .yourTurn
      ) {
        this.usersService.users[client.id].yourTurn = !this.usersService.users[
          client.id
        ].yourTurn;
        this.usersService.users[
          this.usersService.users[client.id].oppId
        ].yourTurn = !this.usersService.users[
          this.usersService.users[client.id].oppId
        ].yourTurn;
      } else {
        const rdm = Math.round(Math.random());
        this.usersService.users[client.id].yourTurn = rdm === 1 ? true : false;
        this.usersService.users[
          this.usersService.users[client.id].oppId
        ].yourTurn = rdm === 0 ? true : false;
      }
      client.emit('startGame', {
        event: 'CreateBoard',
      });
      client.broadcast
        .to(this.usersService.users[client.id].oppId)
        .emit('startGame', {
          event: 'CreateBoard',
        });
    }
    return board;
  }

  @SubscribeMessage('fetchBoard')
  async fetchBoard(client: Socket, data: any) {
    this.logger.log(`Event: FetchBoard`);
    const payload = {
      yourBoard: this.boardsService.boards[client.id],
      oppBoard: this.boardsService.boards[
        this.usersService.users[client.id].oppId
      ],
    };
    client.emit('receiveFetchBoard', payload);
  }

  @SubscribeMessage('attackBoard')
  async attackBoard(client: Socket, index: number) {
    this.logger.log(`Event: AttackBoard`);
    const oppId = this.usersService.users[client.id].oppId;
    this.usersService.users[client.id].yourTurn = false;
    this.usersService.users[oppId].yourTurn = true;
    const payload1 = {
      event: 'AttackBoard',
      user: this.usersService.users[client.id],
    };
    const payload2 = {
      event: 'AttackBoard',
      user: this.usersService.users[oppId],
    };
    client.emit('returnUpdatedUser', payload1);
    client.broadcast.to(oppId).emit('returnUpdatedUser', payload2);
    if (index === -1) {
      const board = this.boardsService.boards[oppId];
      client.broadcast.to(oppId).emit('updateYourBoard', {
        event: 'AttackBoard',
        yourBoard: board,
      });
      return board;
    } else {
      const board = await this.boardsService.isAttacked(index, oppId);
      client.broadcast.to(oppId).emit('updateYourBoard', {
        event: 'AttackBoard',
        yourBoard: board,
      });
      return board;
    }
  }

  @SubscribeMessage('winThisRound')
  async transitionToNextRound(client: Socket, index: number) {
    this.logger.log(`Event: WinThisRound`);
    this.usersService.users[client.id].score =
      this.usersService.users[client.id].score + 1;
    if (this.usersService.users[client.id].score === 3) {
      const mmrDiff =
        this.usersService.users[client.id].score -
        this.usersService.users[this.usersService.users[client.id].oppId].score;
      this.usersService.users[client.id].mmr += mmrDiff;
      this.usersService.users[
        this.usersService.users[client.id].oppId
      ].mmr -= mmrDiff;
      this.usersService.users[client.id].status = Status.ONLINE;
      this.usersService.users[client.id].yourTurn = false;
      this.usersService.users[client.id].score = 0;
      this.usersService.users[this.usersService.users[client.id].oppId].status =
        Status.ONLINE;
      this.usersService.users[
        this.usersService.users[client.id].oppId
      ].yourTurn = false;
      this.usersService.users[
        this.usersService.users[client.id].oppId
      ].score = 0;
      client.emit('finishGame', 'win');
      client.broadcast
        .to(this.usersService.users[client.id].oppId)
        .emit('finishGame', 'lose');
      const payload = {
        event: 'WinThisRound',
        users: this.usersService.users,
      };
      this.server.emit('refreshOnlineUsers', payload);
    } else {
      this.usersService.users[client.id].ready = false;
      this.usersService.users[
        this.usersService.users[client.id].oppId
      ].ready = false;
      this.usersService.users[client.id].score += 1;
      client.emit('nextRound', 'win');
      client.broadcast
        .to(this.usersService.users[client.id].oppId)
        .emit('nextRound', 'lose');
    }
  }
}
