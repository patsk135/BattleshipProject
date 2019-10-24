import React from 'react';
import { socket } from '../socket.js';
import './css/InviteWindow.css';

export const InviteWindow = ({ close, user, users }) => {
    const accept = () => {
        if (user.status === 'ONLINE') {
            socket.emit('acceptInvitation', user.oppId, data => {
                console.log(data);
            });
        }
        close();
    };
    const reject = () => {
        close();
    };

    return (
        <div className='inviteWindow'>
            <div className='buttons'>
                <label>Invitation from {users[user.oppId] && users[user.oppId].name}</label>
                <li>
                    <button onClick={accept} className='primaryButton'>
                        Accept
                    </button>
                    <button onClick={reject} className='secondaryButton'>
                        Reject
                    </button>
                </li>
            </div>
        </div>
    );
};
