export interface User {
  id: string;
  name: string;
  status: Status;
  oppId: string;
  score: number;
}

export interface Users {
  [key: string]: User;
}

export enum Status {
  ONLINE = 'ONLINE',
  READY = 'READY',
  INGAME = 'INGAME',
}
