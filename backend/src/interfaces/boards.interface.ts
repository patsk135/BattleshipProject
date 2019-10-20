export interface Boards {
  [key: string]: Board;
}

export interface Board {
  owner: string;
  status: BoardStatus;
}

interface BoardStatus {
  shipPlacement: number[];
  attackStatus: number[];
}
