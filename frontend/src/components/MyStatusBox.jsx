import React from 'react';
import './css/MyStatusBox.css';

export const MyStatusBox = ({ user }) => {
    return (
        <div className='myStatusBox'>
            <li>UserName: {user.name}</li>
            <li>ID: {user.id}</li>
            <li>OppID: {user.oppId}</li>
            <li>Your Score: {user.score}</li>
            <li>Your Turn: {user.yourTurn ? 'True' : 'False'}</li>
            <li>Status: {user.status}</li>
        </div>
    );
};
