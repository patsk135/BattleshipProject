import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import { BoardsService } from '../boards/boards.service';
import { Logger } from '@nestjs/common';
import {
  MsgToServer,
  Coordinate,
} from 'src/interfaces/gateway/events.gateway.interface';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly usersService: UsersService,
    private readonly boardsService: BoardsService
  ) {}

  private logger: Logger = new Logger('EventsGateway');

  @SubscribeMessage('msgToServer')
  sendMessage(client: Socket, data: MsgToServer) {
    // console.log('in msgToServer');
    this.logger.log(`${data.name}: ${data.text}`);
    this.server.emit('msgToClients', data);
    // return data;
  }

  @SubscribeMessage('invitePlayer')
  invitePlayer(client: Socket, playerId: string) {
    client.broadcast.to(playerId).emit('requestInvite');
  }

  @SubscribeMessage('createBoard')
  createBoard(client: Socket, placement: number[][], oppId: string) {
    this.boardsService.placeShips(placement, client.id).then(res => {
      client.broadcast.to(oppId).emit('oppReady', '');
      return res;
    });
  }

  @SubscribeMessage('attackBoard')
  async attackBoard(client: Socket, coor: Coordinate, oppId: string) {
    this.boardsService.isAttacked(coor, oppId).then(res => {
      client.broadcast.to(oppId).emit('updateYourBoard', res);
      return res;
    });
  }

  @SubscribeMessage('bothReady')
  startGame(client: Socket, oppId: string) {
    const rdm = Math.round(Math.random());
    client.emit('startGame', rdm);
    client.broadcast.to(oppId).emit('startGame', 1 - rdm);
  }
}
