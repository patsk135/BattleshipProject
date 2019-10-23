import React, {useState, useEffect} from 'react';
import "./AdminPage.css";
import { socket } from './socket';

export const AdminPage = () => {
  
  const [users, setUsers] = useState({})
  useEffect(()=> {
    socket.emit('fetchUsers')
    socket.on('refreshOnlineUsers', payload => {
      setUsers(payload.users)
    })
  },[])

  return (

    <div>

      <div className="adminPageHeader">
        <li>This is admin page</li>
        <li>UserName:</li>
        <li>ID:</li>
        <li>Status: Admin</li>
      </div>

      <div className="adminPagePlayers">
        <h1 align="center">Players in the server</h1>
        <ul align="center">Number of players online: </ul>
      </div>

      <div className="boardPlayer">
        <div className="navPlayer">
          <li>Player Name</li>
          <li>Status</li>
          <li>MMR</li>
        </div>
        <div className="cardPlayer">
          {Object.values(users)
              .filter(one => one.id)
              .map(eachUser => (
                <ul key={eachUser.id}>
                  <li>{eachUser.name}</li>
                  <li>{eachUser.status}</li>
                  <li>{eachUser.mmr}</li>
                </ul>
            ))}
        </div>
      </div>

      <div className="adminPagePlayers">
        <h1 align="center">Games in the server</h1>
        <ul align="center">Number of games playing: </ul>
      </div>

      <div className="boardGame">
        <div className="navGame">
          <li>No.</li>
          <li>Player1</li>
          <li>Player2</li>
          <li>Game No.</li>
          <li>Status</li>
          <li>Reset</li>
        </div>
        <div className="cardGame">
          {Object.values(users)
            .filter(one => one.id)
            .map(eachUser => (
              <ul key={eachUser.id}>
                <li>{eachUser.name}</li>
                <li>{eachUser.status}</li>
                <li>{eachUser.mmr}</li>
                <li>{eachUser.name}</li>
                <li>{eachUser.status}</li>
                <li>{eachUser.mmr}</li>
              </ul>
          ))}
        </div>
      </div>

    </div>
    
  );

};
