import { Injectable } from '@nestjs/common';
import { BOARDS } from '../mocks/boards.mocks';
import { findBoard, existBoard } from './utils';
import { Coordinate } from 'src/interfaces/gateway/events.gateway.interface';

@Injectable()
export class BoardsService {
  boards = BOARDS;

  initBoard(userId: string): Promise<any> {
    return new Promise(resolve => {
      if (existBoard(this.boards, userId) !== -1) {
        throw new Error('User already has a board!');
      }
      const dArray: number[][][] = new Array(2)
        .fill(false)
        .map(() => new Array(8).fill(false).map(() => new Array(8).fill(0)));
      const newBoard = {
        owner: userId,
        status: dArray,
      };
      this.boards.push(newBoard);
      resolve(newBoard);
    });
  }

  findBoard(userId: string): Promise<any> {
    return new Promise(resolve => {
      resolve(findBoard(this.boards, userId)[0]);
    });
  }

  placeShips(shipPlacement: number[][], userId: string): Promise<any> {
    return new Promise(resolve => {
      const board = findBoard(this.boards, userId)[0];
      if (board == null) {
        throw new Error(`User doesn't have board!`);
      } else {
        board.status[0] = shipPlacement;
      }
      resolve(board);
    });
  }

  isAttacked(coor: Coordinate, oppId: string): Promise<any> {
    return new Promise(resolve => {
      const board = findBoard(this.boards, oppId)[0];
      if (board == null) {
        throw new Error(`User doesn't have board!`);
      } else {
        const hasShip = board.status[0][coor.x][coor.y];
        if (hasShip === 0) {
          board.status[1][coor.x][coor.y] = -1;
        } else if (hasShip === 1) {
          board.status[1][coor.x][coor.y] = 1;
        } else {
          throw new Error('Bug: hasShip !== 0 && !== 1');
        }
      }
      resolve(board);
    });
  }
}
