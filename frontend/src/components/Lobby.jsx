import React from 'react';
import { UserStatusBar } from './UserStatusBar';
import { OnlinePlayersTab } from './OnlinePlayersTab';
import { LobbyChat } from './LobbyChat';
import './css/Lobby.css';

const OnlineLobby = ({ user, users, messages, open }) => {
    return (
        <>
            <div className='lobby-right-container'>
                <UserStatusBar user={user} open={open} />
                <LobbyChat messages={messages} />
            </div>
            <OnlinePlayersTab user={user} users={users} />
        </>
    );
};

export const Lobby = ({ user, users, messages, open }) => {
    return (
        <div className='lobby-container'>
            {user.status !== 'INGAME' ? (
                <OnlineLobby user={user} users={users} messages={messages} open={open} />
            ) : null}
        </div>
    );
};
