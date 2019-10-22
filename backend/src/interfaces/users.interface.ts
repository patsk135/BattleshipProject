export interface User {
  id: string;
  name: string;
  status: Status;
  oppId: string;
  mmr: number;
  ready: boolean;
  score: number;
  yourTurn: boolean;
}

export interface Users {
  [key: string]: User;
}

export enum Status {
  ONLINE = 'ONLINE',
  READY = 'READY',
  INGAME = 'INGAME',
}
