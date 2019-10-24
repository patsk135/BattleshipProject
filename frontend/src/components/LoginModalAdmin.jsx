import React, { useState } from 'react';
import { socket } from '../socket';
import './css/LoginModalAdmin.css';

export const LoginModalAdmin = ({ close }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const handleInputName = event => {
        setName(event.target.value);
    };
    const handleInputPassword = event => {
        setPassword(event.target.value);
    };
    const onClick = () => {
        const payload = {
            username: name,
            password: password,
        };
        socket.emit('adminLogin', payload, err => {
            if (err) {
                console.log(err);
            } else {
                close();
            }
        });
    };
    return (
        <div style={{ padding: '30vh 30vw' }}>
            <div className='loginModalAdmin'>
                <div className='adminLogin'>Admin Login</div>
                <div className='usernamePassword'>Username</div>
                <input className='input' type='text' value={name} onChange={handleInputName} />
                <div className='usernamePassword'>Password</div>
                <input
                    className='input'
                    type='password'
                    value={password}
                    onChange={handleInputPassword}
                />
                <div>
                    <button className='btn' onClick={onClick}>
                        Login Admin
                    </button>
                </div>
            </div>
        </div>
    );
};
