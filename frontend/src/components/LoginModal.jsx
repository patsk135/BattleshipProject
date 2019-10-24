import React, { useState } from 'react';
import { socket } from '../socket';
import './css/LoginModal.css';

export const LoginModal = ({ close, setMsg }) => {
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('/profiles/1.jpeg');

    const handleInput = event => {
        setName(event.target.value);
    };

    const handleOnSelect = event => {
        console.log('in OnSelect');
        setAvatar(event.target.value);
    };

    const onClick = () => {
        if (name !== '') {
            const payload = {
                name,
                avatar,
            };
            socket.emit('createUser', payload, err => {
                if (err) {
                    setMsg(`Error: ${err.message}`);
                    console.log(err);
                } else {
                    setMsg(`Welcome ${name}. Let's play Battleship.`);
                    close();
                }
            });
        }
    };

    const avatars = [
        '/profiles/1.jpeg',
        '/profiles/2.jpeg',
        '/profiles/3.jpeg',
        '/profiles/4.jpeg',
        '/profiles/5.jpeg',
        '/profiles/6.jpeg',
        '/profiles/7.jpeg',
        '/profiles/8.jpeg',
        '/profiles/9.jpeg',
        '/profiles/10.jpeg',
        '/profiles/11.jpeg',
        '/profiles/12.jpeg',
        '/profiles/13.jpeg',
        '/profiles/14.jpeg',
        '/profiles/15.jpeg',
    ];

    return (
        <div className='loginModal'>
            <p className='enterYn'>Enter Your Name </p>
            <label>
                <input type='text' onChange={handleInput} className='input' />
            </label>
            <div>
                <form className='avt'>
                    <label className='enterYn small'>Choose your avatar</label>
                    <div>
                        {avatars.map((image, index) => {
                            return (
                                <ul key={index}>
                                    <input
                                        type='radio'
                                        name='avatar'
                                        value={image}
                                        checked={avatar === image}
                                        onChange={handleOnSelect}
                                    />
                                    <img src={image} alt=''></img>
                                </ul>
                            );
                        })}
                    </div>
                </form>
            </div>
            <div>
                <button onClick={e => onClick()} className='primaryButton submit'>
                    Submit
                </button>
            </div>
        </div>
    );
};
