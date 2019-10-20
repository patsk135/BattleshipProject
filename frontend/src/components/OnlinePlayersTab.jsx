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
        <div>
            <ul className='nav'>
                <li>ONLINE PLAYERS</li>
                <li>STATUS</li>
                <li>SCORE</li>
            </ul>
            <div className='container'>
                {Object.values(users)
                    .filter(one => one.id !== user.id)
                    .map(eachUser => (
                        <ul key={eachUser.id}>
                            <li>{eachUser.name}</li>
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
