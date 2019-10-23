import React, { useState, useEffect } from 'react';
import './AdminPage.css';
import { socket } from './socket';

export const AdminPage = () => {
    const [users, setUsers] = useState({});
    const [numberOfUsers, setNumberOfUsers] = useState(0);
    const [rooms, setRooms] = useState([]);
    const [numberOfRooms, setNumberOfRooms] = useState(0);
    //let number = users.size();

    const handleOnclick = room => {
        socket.emit('resetRoom', room);
    };

    useEffect(() => {
        socket.emit('fetchUsers');
        socket.emit('fetchRooms');
        socket.emit('addAdmin');
        socket.on('onConnection', () => {
            socket.emit('fetchUsers');
            socket.emit('fetchRooms');
        });
        socket.on('refreshOnlineUsers', payload => {
            setUsers(payload.users);
        });
        socket.on('refreshRooms', payload => {
            console.log('inh fetch room');
            console.log(payload);
            setRooms(payload.rooms);
        });
    }, []);

    useEffect(() => {
        setNumberOfUsers(Object.keys(users).length);
    }, [users]);

    useEffect(() => {
        setNumberOfRooms(Object.keys(rooms).length);
    }, [rooms]);

    return (
        <div>
            <div className='adminPageHeader'>
                <li>This is admin page</li>
            </div>
            <div className='adminPagePlayers'>
                <h2 align='center'>PLAYERS IN THE SERVER</h2>
                <ul align='center'>Number of players online: {numberOfUsers}</ul>
            </div>
            <div className='boardPlayer'>
                <div className='navPlayer'>
                    <li>Player Name</li>
                    <li>Player ID</li>
                    <li>OPP ID</li>
                    <li>Status</li>
                    <li>Ready</li>
                    <li>MMR</li>
                </div>
                <div className='cardPlayer'>
                    {Object.values(users).map(eachUser => (
                        <ul>
                            <li>{eachUser.name}</li>
                            <li>{eachUser.id}</li>
                            <li>{eachUser.oppId}</li>
                            <li>{eachUser.status}</li>
                            <li>{eachUser.ready}</li>
                            <li>{eachUser.mmr}</li>
                        </ul>
                    ))}
                </div>
            </div>
            <div className='adminPagePlayers'>
                <h2 align='center'>GAMES IN THE SERVER</h2>
                <ul align='center'>Number of games playing: {numberOfRooms}</ul>
            </div>
            <div className='boardGame'>
                <div className='navGame'>
                    <li>No.</li>
                    <li>Player 1</li>
                    <li>Player 2</li>
                    <li>Reset</li>
                </div>
                <div className='cardGame'>
                    {rooms.map((eachRoom, index) => (
                        <ul key={index}>
                            <li>{index + 1}</li>
                            <li>{eachRoom.player1}</li>
                            <li>{eachRoom.player2}</li>
                            <li>
                                <button className='resetBtn' onClick={e => handleOnclick(eachRoom)}>
                                    reset
                                </button>
                            </li>
                        </ul>
                    ))}
                </div>
            </div>
        </div>
    );
};
