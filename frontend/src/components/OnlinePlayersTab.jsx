import React from 'react';
import './css/OnlinePlayersTab.css';
import { socket } from '../socket';

export const OnlinePlayersTab = ({ user, users }) => {
    
    const onClick = oppId => {
        console.log('Before sendInvitation');
        console.log(oppId);
        socket.emit('sendInvitation', oppId);
    };

    return (
        <div className='online-players-container'>
            <ul className='nav'>
                <p>
                    ONLINE
                    <br />
                    PLAYERS
                </p>
                <p>STATUS</p>
                <p>MMR</p>
            </ul>
            <div className='container'>
                {Object.values(users)
                    .filter(one => one.id !== user.id)
                    .map(eachUser => (
                        <ul key={eachUser.id}>
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
