import { Board } from '../interfaces/boards.interface';

export const findBoard = (boards: Board[], owner: string) =>
  boards.filter(board => board.owner === owner);

export const existBoard = (boards: Board[], owner: string) =>
  boards.findIndex(board => board.owner === owner);
