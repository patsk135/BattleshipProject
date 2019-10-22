import React, { useState } from 'react';
import { socket } from '../socket';
import './css/LoginModal.css';

export const LoginModal = ({ close }) => {
    const [name, setName] = useState('');
    const handleInput = event => {
        setName(event.target.value);
    };
    const onClick = () => {
        if (name !== '') {
            socket.emit('createUser', name, err => {
                if (err) {
                    console.log(err);
                } else {
                    close();
                }
            });
        }
    };
    return (
        <div className='loginModal'>
            <p className='enterYn'>Enter Your Name </p>
            <label>
                <input type='text' value={name} onChange={handleInput} className='input' />
            </label>
            <div>
                <button onClick={onClick} className='primaryButton submit'>
                    Submit
                </button>
            </div>
        </div>
    );
};
