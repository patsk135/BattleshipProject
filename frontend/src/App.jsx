import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { socket } from './socket';

import { LoginModal } from './components/LoginModal';
import { OnlinePlayersTab } from './components/OnlinePlayersTab';
import { InviteWindow } from './components/InviteWindow';
import { MyStatusBox } from './components/MyStatusBox';
import { LobbyChat } from './components/LobbyChat';
import { AdminPage } from './components/AdminPage';
import { CreateBoard } from './components/game/createBoard/CreateBoard';
import { InGameBoard } from './components/game/inGameBoard/InGameBoard';
import { InGameWindow } from './components/game/inGameBoard/InGameWindow';

function App() {
    const [user, setUser] = useState({});
    const [users, setUsers] = useState({});
    const [messages, setMessages] = useState([]);
    const [turn, setTurn] = useState(0);

    const [showLogin, setShowLogin] = useState(true);
    const closeShowLogin = () => setShowLogin(false);

    const [showInviteWindow, setShowInviteWindow] = useState(false);
    const closeInviteWindow = () => setShowInviteWindow(false);

    const [showCreateBoard, setShowCreateBoard] = useState(false);

    const [showInGameWindow, setShowInGameWindow] = useState(false);
    const openInGameWindow = () => {
        setShowCreateBoard(false);
        setShowInGameWindow(true);
    };
    const closeInGameWindow = () => setShowInGameWindow(false);

    useEffect(() => {
        // Ping ///////////////////////////////////////////////
        socket.on('pingToClient', payload => {
            // console.log(payload);
        });
        setInterval(() => {
            socket.emit('pingToServer', 'Ping!');
        }, 20000);
        //////////////////////////////////////////////////////

        socket.on('returnUpdatedUser', payload => {
            console.log('ReturnUpdatedUser: ');
            console.log(payload);
            setUser(payload.user);
        });

        socket.on('refreshOnlineUsers', payload => {
            console.log('RefreshOnlineUsers: ');
            // console.log(payload);
            console.log(payload);
            // console.log(users);
            setUsers(payload.users);
        });

        socket.on('msgToClients', payload => {
            setMessages(oldmsg => [...oldmsg, payload.message]);
        });

        socket.on('getInvitation', ({ event, clientId }) => {
            console.log(`GetInvitation -> OppId: ${clientId}`);
            setShowInviteWindow(true);
            setUser(prevUser => {
                return {
                    ...prevUser,
                    oppId: clientId,
                };
            });
        });

        socket.on('preparationStage', payload => {
            console.log(`PreparationStage`);
            setShowCreateBoard(true);
        });

        socket.on('startGame', payload => {
            console.log('StartGame');
            openInGameWindow();
            socket.emit('fetchBoard', user.oppId);
            setTurn(payload.coin);
        });
    }, []);

    return (
        <>
            <Router>
                <Switch>
                    <Route path='/test'>
                        <InGameWindow></InGameWindow>
                    </Route>
                    <Route path='/admin'>
                        <AdminPage></AdminPage>
                    </Route>
                    <Route path='/'>
                        <div className='App'>
                            <header className='App-header'>
                                <div>{<MyStatusBox user={user} />}</div>
                                {showCreateBoard && <CreateBoard user={user}></CreateBoard>}
                                {showInGameWindow && (
                                    <InGameWindow
                                        turn={turn}
                                        setTurn={setTurn}
                                        close={closeInGameWindow}
                                    ></InGameWindow>
                                )}
                                {showLogin && <LoginModal close={closeShowLogin} />}
                                {<OnlinePlayersTab user={user} users={users}></OnlinePlayersTab>}
                                {showInviteWindow && (
                                    <InviteWindow close={closeInviteWindow} user={user} />
                                )}
                                <div>{<LobbyChat messages={messages} />}</div>
                            </header>
                        </div>
                    </Route>
                </Switch>
            </Router>
        </>
    );
}

export default App;
