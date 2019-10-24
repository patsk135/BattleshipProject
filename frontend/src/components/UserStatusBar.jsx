import React from 'react';
import './css/UserStatusBar.css';
import { socket } from '../socket';

export const UserStatusBar = ({ user }) => {
    const ready = () => {
        console.log('Ready');
        socket.emit('playerReady');
    };

    const logout = () => {
        console.log('Logout');
        socket.emit('deleteUser', user.id);
    };

    return (
        <div className='myHelloBox'>
            <div className='profile-container'>
                <div className='avatar'>
                    <img src='/profiles/2.jpeg' alt='' />
                </div>
                <p className='hello'>Hello, {user.name}</p>
                <p className='MMR'>MMR: {user.mmr}</p>
                <p className='status'>{user.status}</p>
            </div>
            <div className='buttons-container'>
                <button className='primaryButton' onClick={e => ready()}>
                    Ready
                </button>
                <button className='secondaryButton' onClick={e => logout()}>
                    Logout
                </button>
            </div>
        </div>
    );
};
