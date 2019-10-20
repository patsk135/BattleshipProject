import { Injectable } from '@nestjs/common';
import { BOARDS } from '../../mocks/boards.mocks';
import { Coordinate } from 'src/interfaces/events.gateway.interface';
import { Boards, Board } from 'src/interfaces/boards.interface';

@Injectable()
export class BoardsService {
  boards: Boards = BOARDS;

  async initBoard(userId: string): Promise<Board> {
    if (userId in this.boards) {
      throw new Error('User already has a board!');
    }
    // const shipPlacement: number[][] = new Array(8)
    //   .fill(false)
    //   .map(() => new Array(8).fill(0));
    // const attackStatus: number[][] = new Array(8)
    //   .fill(false)
    //   .map(() => new Array(8).fill(0));
    const shipPlacement: number[] = new Array(64).fill(0);
    const attackStatus: number[] = new Array(64).fill(0);
    const board: Board = {
      owner: userId,
      status: {
        shipPlacement,
        attackStatus,
      },
    };
    this.boards[userId] = board;
    return board;
  }

  async findBoard(userId: string): Promise<Board> {
    if (userId in this.boards) {
      return this.boards[userId];
    } else {
      throw new Error(`User doesn't have a board`);
    }
  }

  async placeShips(shipPlacement: number[], userId: string): Promise<Board> {
    if (userId in this.boards) {
      this.boards[userId].status.shipPlacement = shipPlacement;
    } else {
      throw new Error(`User doesn't have a board!`);
    }
    return this.boards[userId];
  }

  async isAttacked(index: number, oppId: string): Promise<Board> {
    if (oppId in this.boards) {
      const board = this.boards[oppId];
      const hasShip = board.status.shipPlacement[index];
      if (hasShip === 0) {
        board.status.attackStatus[index] = -1;
      } else if (hasShip === 1) {
        board.status.attackStatus[index] = 1;
      } else {
        throw new Error('Bug: hasShip !== 0 && !== 1');
      }
      return board;
    } else {
      throw new Error(`User doesn't have board!`);
    }
  }
}
