export interface MsgToServer {
  name: string;
  text: string;
}

// export interface Rooms {
//   rooms?: Room[];
// }

export interface Room {
  player1: string;
  player2: string;
}
