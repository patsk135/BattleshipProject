import socketIOClient from 'socket.io-client';

// export const socket = socketIOClient('localhost:3000');
export const socket = socketIOClient('https://battleship-netcentric-project.herokuapp.com/');
// export const socket = socketIOClient(process.env.REACT_APP_URL);
