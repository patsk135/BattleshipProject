import React, { useState } from 'react';
import { socket } from '../socket.js';
import './css/UserStatusBar.css';

export const UserStatusBar = ({ user }) => {
    return (
        <div className='myHelloBox'>
            <li className='hello'>Hello, {user.name}</li>
            <li className='score'>{user.score}</li>
            <li className='status'>{user.status}</li>
            <div className='buttonss'>
                <li>
                    <button className='primaryButton widthBt'>Ready</button>
                </li>
                <li>
                    <button className='secondaryButton widthBt'>Logout</button>
                </li>
            </div>
        </div>
    );
};
