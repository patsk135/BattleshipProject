export interface User {
  id: string;
  name: string;
  status: Status;
  oppId: string;
  score: number;
}

export enum Status {
  ONLINE,
  READY,
  INGAME,
}
