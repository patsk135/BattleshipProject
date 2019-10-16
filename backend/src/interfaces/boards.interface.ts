export interface Boards {
  [key: string]: Board;
}

export interface Board {
  owner: string;
  status: number[][][];
}
