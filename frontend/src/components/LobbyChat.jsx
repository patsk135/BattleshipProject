import React, { useState } from 'react';
import { socket } from '../socket.js';
import './css/LobbyChat.css';

export const LobbyChat = ({ messages }) => {
    const [message, setMessage] = useState('');
    const sendMessage = () => {
        // console.log(`Send msg: ${message}`);
        if (message !== '') {
            socket.emit('msgToServer', message);
            setMessage('');
        }
    };
    return (
        <div className='card'>
            <div className='card-block chatBox'>
                <ul>
                    {messages.map(msg => (
                        <li key={msg}>
                            {msg.name}: {msg.text}
                        </li>
                    ))}
                </ul>
            </div>
            <textarea
                className='form-control'
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder='Enter message...'
            ></textarea>
            <button className='btn' onClick={e => sendMessage()}>
                Send
            </button>
        </div>
    );
};
