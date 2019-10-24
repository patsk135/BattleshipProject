import React, { useState } from 'react';
import './css/OnlinePlayersTab.css';
import './css/UserStatusBar.css';
import { socket } from '../socket';

const customSort = (arr, f) => Object.values(arr).sort(f);

const sortMmr = (a, b) => a.mmr - b.mmr;
const sortName = (a, b) => (a.name.attr > b.name.attr) - (a.name.attr < b.name.attr);
const sortStatus = (a, b) => (a.status.attr > b.name.attr) - (a.name.attr < b.name.attr);

export const OnlinePlayersTab = ({ user, users }) => {
    const onClick = oppId => {
        console.log('Before sendInvitation');
        console.log(oppId);
        socket.emit('sendInvitation', oppId);
    };

    const [sorted, setSorted] = useState(users);

    return (
        <div className='online-players-container'>
            <ul className='nav'>
                <p>AVATAR</p>
                <p onClick={() => setSorted(customSort(users, sortName))}>
                    ONLINE
                    <br />
                    PLAYERS
                </p>
                <p onClick={() => setSorted(customSort(users, sortStatus))}>STATUS</p>
                <p onClick={() => setSorted(customSort(users, sortMmr))}>MMR</p>
                <p>
                    INVITE
                    <br />
                    BUTTON
                </p>
            </ul>
            <div className='container'>
                {Object.values(sorted)
                    .filter(one => one.id !== user.id)
                    .map(eachUser => (
                        <ul key={eachUser.id}>
                            <li>
                                <div className='avatar'>
                                    <img src={eachUser.avatar} alt=''></img>
                                </div>
                            </li>
                            <li className='onlinePlayers'>{eachUser.name}</li>
                            <li>{eachUser.status}</li>
                            <li>{eachUser.mmr}</li>
                            <li>
                                <button
                                    className={`inviteButton ${eachUser.status !== 'ONLINE' &&
                                        'disabled'}`}
                                    onClick={e => onClick(eachUser.id)}
                                >
                                    invite
                                </button>
                            </li>
                        </ul>
                    ))}
            </div>
        </div>
    );
};
