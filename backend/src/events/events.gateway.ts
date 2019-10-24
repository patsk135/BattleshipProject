import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from './services/users.service';
import { BoardsService } from './services/boards.service';
import { Logger } from '@nestjs/common';
import { MsgToServer, Room } from '../interfaces/common.interface';
import { Status, User } from '../interfaces/users.interface';

import { ROOMS, admin, readyPlayer } from '../mocks/rooms.mocks';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly usersService: UsersService,
    private readonly boardsService: BoardsService
  ) {}

  private logger: Logger = new Logger('EventsGateway');

  @SubscribeMessage('adminLogin')
  adminLogin(client: Socket, payload: any) {
    this.logger.log('Event: AdminLogin');
    console.log(payload);
    const { username, password } = payload;
    if (username === 'netcentric' && password === 'veryeazy') {
      client.emit('loginSuccess');
    } else {
      client.emit('loginFail');
    }
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('onConnection');

    setInterval(() => {
      client.emit('1sec');
    }, 1000);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // console.log('Before');
    // console.log(ROOMS);
    // console.log('admin');
    // console.log(admin);

    const adminIndex = admin.findIndex(id => id === client.id);
    if (adminIndex !== -1) {
      admin.splice(adminIndex, 1);
    }
    // console.log(admin);

    const index = ROOMS.findIndex(
      room => room.player1 === client.id || room.player2 === client.id
    );
    if (index !== -1) {
      ROOMS.splice(index, 1);
    }

    const adminPayload = {
      event: 'HandleDisconnect',
      rooms: ROOMS,
    };
    // console.log(admin);
    admin.map(id => {
      // console.log('map refersh room');
      // console.log(admin);
      // console.log(id);
      client.broadcast.to(id).emit('refreshRooms', adminPayload);
    });

    // console.log('After');
    // console.log(ROOMS);

    delete this.boardsService.boards[client.id];

    const user = this.usersService.users[client.id];
    if (user !== undefined && user.oppId !== '') {
      const opp = this.usersService.users[user.oppId];
      if (opp.status === Status.INGAME) {
        const updatedUser: User = {
          ...opp,
          oppId: '',
          status: Status.ONLINE,
          ready: false,
          score: 0,
          yourTurn: false,
        };
        updatedUser.mmr = updatedUser.mmr + 1;
        this.usersService.updateUser(updatedUser);
        client.broadcast.to(opp.id).emit('finishGame', 'oppDisconnect');
      }
    }

    const users = await this.usersService.deleteUser(client.id);
    const payload = {
      event: this.handleDisconnect.name,
      users,
    };
    this.server.emit('refreshOnlineUsers', payload);
  }

  @SubscribeMessage('addAdmin')
  async addAdmin(client: Socket, data: any) {
    admin.push(client.id);
  }

  @SubscribeMessage('fetchUsers')
  async fetchUsers(client: Socket, data: any) {
    const payload = {
      event: 'FetchUsers',
      users: this.usersService.users,
    };
    client.emit('refreshOnlineUsers', payload);
  }

  @SubscribeMessage('fetchRooms')
  async fetchRooms(client: Socket, data: any) {
    this.logger.log('Event: FetchRooms');
    // console.log(admin);

    const payload = {
      event: 'FetchRooms',
      rooms: ROOMS,
    };
    // console.log(payload);
    client.emit('refreshRooms', payload);
  }

  @SubscribeMessage('resetRoom')
  async resetRoom(client: Socket, room: Room) {
    this.logger.log('Event: ResetRoom');
    // console.log(room);

    const user1 = this.usersService.users[room.player1];
    const user2 = this.usersService.users[room.player2];

    const updatedUser1 = {
      ...user1,
      status: Status.ONLINE,
      oppId: '',
      ready: false,
      score: 0,
      yourTurn: false,
    };
    this.usersService.updateUser(updatedUser1);

    const updatedUser2 = {
      ...user2,
      status: Status.ONLINE,
      oppId: '',
      ready: false,
      score: 0,
      yourTurn: false,
    };
    this.usersService.updateUser(updatedUser2);

    client.broadcast.to(room.player1).emit('backToLobby');
    client.broadcast.to(room.player2).emit('backToLobby');

    // console.log(ROOMS);
    const index = ROOMS.findIndex(
      eachRoom =>
        eachRoom.player1 === room.player1 || eachRoom.player2 === room.player1
    );
    if (index !== -1) {
      ROOMS.splice(index, 1);
    }
    // console.log(index);
    // console.log(ROOMS);

    const adminPayload = {
      event: 'ResetRoom',
      rooms: ROOMS,
    };
    admin.map(id => {
      // console.log('in map emit refreshRooms');
      // console.log(id);
      if (id === client.id) {
        client.emit('refreshRooms', adminPayload);
      } else {
        client.broadcast.to(id).emit('refreshRooms', adminPayload);
      }
    });

    const payload = {
      event: this.createUser.name,
      users: this.usersService.users,
    };
    this.server.emit('refreshOnlineUsers', payload);
  }

  @SubscribeMessage('createUser')
  async createUser(client: Socket, payload: any) {
    const {name, avatar} = payload
    this.logger.log(`Event: CreateUser => Name: ${name} Avata: ${avatar}`);
    const user: User = {
      id: client.id,
      name,
      avatar,
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
    delete this.boardsService.boards[userId];
    const payload = {
      event: this.deleteUser.name,
      users: await this.usersService.deleteUser(userId),
    };
    this.server.emit('refreshOnlineUsers', payload);
    client.emit('onConnection');
  }

  @SubscribeMessage('pingToServer')
  ping(client: Socket, ping: any) {
    const msg = `${client.id}: Ping! ${Date().toString()}`;
    const payload = {
      event: this.ping.name,
      msg,
    };
    client.emit('emit', payload);
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
    this.server.emit('msgToClients', {
      event: 'MsgToServer',
      message,
    });
  }

  @SubscribeMessage('playerReady')
  async playerReady(client: Socket, data: any) {
    this.logger.log(`Event: PlayerReady`);
    if (readyPlayer.id === '') {
      readyPlayer.id = client.id;
      const player = this.usersService.users[client.id];
      const updatedPlayer = {
        ...player,
        status: Status.READY,
      };
      const returnedPlayer = await this.usersService.updateUser(updatedPlayer);

      const payload = {
        event: 'PlayerReady',
        user: returnedPlayer[client.id],
      };
      client.emit('returnUpdatedUser', payload);
    } else {
      const player1 = this.usersService.users[client.id];
      const player2 = this.usersService.users[readyPlayer.id];
      readyPlayer.id = '';

      const updatedPlayer1 = {
        ...player1,
        status: Status.INGAME,
        oppId: player2.id,
      };
      this.usersService.updateUser(updatedPlayer1);

      const updatedPlayer2 = {
        ...player2,
        status: Status.INGAME,
        oppId: client.id,
      };
      this.usersService.updateUser(updatedPlayer2);

      const payload1 = {
        event: 'PlayerReady',
        user: this.usersService.users[player1.id],
      };
      client.emit('returnUpdatedUser', payload1);

      const payload2 = {
        event: 'PlayerReady',
        user: this.usersService.users[player2.id],
      };
      client.broadcast.to(player2.id).emit('returnUpdatedUser', payload2);

      client.emit('preparationStage', {
        event: 'PlayerReady',
      });
      client.broadcast.to(player2.id).emit('preparationStage', {
        event: 'PlayerReady',
      });

      const room: Room = {
        player1: player1.id,
        player2: player2.id,
      };
      ROOMS.push(room);

      const adminPayload = {
        event: 'PlayerReady',
        rooms: ROOMS,
      };
      admin.map(id => {
        client.broadcast.to(id).emit('refreshRooms', adminPayload);
      });
    }

    const payload = {
      event: 'PlayerReady',
      users: this.usersService.users,
    };
    this.server.emit('refreshOnlineUsers', payload);
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
    const user = this.usersService.users[client.id];
    const opp = this.usersService.users[oppId];
    if (opp.status === Status.ONLINE) {
      // console.log('Before');
      // console.log(ROOMS);
      const room: Room = {
        player1: client.id,
        player2: oppId,
      };
      ROOMS.push(room);

      const adminPayload = {
        event: 'HandleDisconnect',
        rooms: ROOMS,
      };
      admin.map(id => {
        client.broadcast.to(id).emit('refreshRooms', adminPayload);
      });
      // console.log('Before');
      // console.log(ROOMS);

      const updatedOpp = {
        ...opp,
        status: Status.INGAME,
        oppId: client.id,
      };
      this.usersService.updateUser(updatedOpp);
      client.broadcast.to(oppId).emit('returnUpdatedUser', {
        event: 'AcceptInvitation',
        user: updatedOpp,
      });

      const updatedUser = {
        ...user,
        status: Status.INGAME,
        oppId,
      };
      client.emit('returnUpdatedUser', {
        event: 'AcceptInvitation',
        user: updatedUser,
      });

      const users = await this.usersService.updateUser(updatedUser);
      const payload = {
        event: 'AcceptInvitation',
        users,
      };
      this.server.emit('refreshOnlineUsers', payload);
      client.broadcast.to(oppId).emit('preparationStage', {
        event: 'AcceptInvitation',
      });
      client.emit('preparationStage', {
        event: 'AcceptInvitation',
      });
    } else {
      return { message: `Opponent status !== ONLINE` };
    }
  }

  @SubscribeMessage('createBoard')
  async createBoard(client: Socket, shipPlacement: number[]) {
    this.logger.log(`Event: CreateBoard`);
    const board = this.boardsService.boards[client.id];
    board.status.shipPlacement = shipPlacement;
    board.status.attackStatus = new Array(64).fill(0);

    const user = this.usersService.users[client.id];
    const opp = this.usersService.users[user.oppId];

    user.ready = true;

    if (user.ready && opp.ready) {
      // console.log('in BothReady');
      const payload = {
        yourBoard: board,
        oppBoard: this.boardsService.boards[opp.id],
      };
      client.emit('receiveFetchBoard', payload);

      if (user.yourTurn || opp.yourTurn) {
        user.yourTurn = !user.yourTurn;
        opp.yourTurn = !opp.yourTurn;
      } else {
        const rdm = Math.round(Math.random());
        user.yourTurn = rdm === 1 ? true : false;
        opp.yourTurn = rdm === 0 ? true : false;
      }
      client.emit('startGame', {
        event: 'CreateBoard',
      });
      client.broadcast.to(opp.id).emit('startGame', {
        event: 'CreateBoard',
      });
    }
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
    const user = this.usersService.users[client.id];
    const opp = this.usersService.users[user.oppId];

    user.yourTurn = false;
    opp.yourTurn = true;

    const payload1 = {
      event: 'AttackBoard',
      user,
    };
    client.emit('returnUpdatedUser', payload1);

    const payload2 = {
      event: 'AttackBoard',
      user: opp,
    };
    client.broadcast.to(opp.id).emit('returnUpdatedUser', payload2);

    const board = this.boardsService.boards[opp.id];
    if (index === -1) {
      client.broadcast.to(opp.id).emit('updateYourBoard', {
        event: 'AttackBoard',
        yourBoard: board,
      });
    } else {
      if (board.status.shipPlacement[index] === 1) {
        client.broadcast.to(opp.id).emit('increaseOppHit');
      }
      const newBoard = await this.boardsService.isAttacked(index, opp.id);
      client.broadcast.to(opp.id).emit('updateYourBoard', {
        event: 'AttackBoard',
        yourBoard: newBoard,
      });
      return newBoard;
    }
  }

  @SubscribeMessage('winThisRound')
  async transitionToNextRound(client: Socket, index: number) {
    this.logger.log(`Event: WinThisRound`);
    const user = this.usersService.users[client.id];
    const opp = this.usersService.users[user.oppId];
    user.score = user.score + 1;
    if (user.score === 1) {
      const mmrDiff = Math.abs(user.score - opp.score);

      const updatedUser = {
        ...user,
        status: Status.ONLINE,
        oppId: '',
        mmr: user.mmr + mmrDiff,
        ready: false,
        score: 0,
        yourTurn: false,
      };
      this.usersService.updateUser(updatedUser);

      const updatedOpp = {
        ...opp,
        status: Status.ONLINE,
        oppId: '',
        mmr: opp.mmr - mmrDiff,
        ready: false,
        score: 0,
        yourTurn: false,
      };
      this.usersService.updateUser(updatedOpp);

      client.emit('finishGame', 'win');
      client.broadcast.to(opp.id).emit('finishGame', 'lose');

      const payload = {
        event: 'WinThisRound',
        users: this.usersService.users,
      };
      this.server.emit('refreshOnlineUsers', payload);

      // console.log('Before');
      // console.log(ROOMS);

      const index = ROOMS.findIndex(
        room =>
          room.player1 === client.id ||
          room.player1 === this.usersService.users[client.id].oppId
      );
      if (index !== -1) {
        ROOMS.splice(index, 1);
      }

      const adminPayload = {
        event: 'HandleDisconnect',
        rooms: ROOMS,
      };
      // console.log(admin);
      admin.map(id => {
        console.log('in mapping refreshroom');
        // console.log(id);
        // console.log(ROOMS);
        client.broadcast.to(id).emit('refreshRooms', adminPayload);
      });
      // console.log('After');
      // console.log(ROOMS);
    } else {
      user.ready = false;
      opp.ready = false;

      client.emit('nextRound', 'win');
      client.broadcast.to(opp.id).emit('nextRound', 'lose');
    }
  }
}
