import React from 'react';
import { socket } from '../socket.js';
import './css/WaitingReadyWindow.css';

export const WaitingReadyWindow = ({ close }) => {
    const cancel = () => {
        socket.emit('playerReady');
        close();
    };

    return (
        <div className='waitingReadyWindow'>
            <div>
                <label>Waiting for opponent..</label>
                <ul>
                    <button onClick={cancel} className='btn'>
                        Cancel
                    </button>
                </ul>
            </div>
        </div>
    );
};
