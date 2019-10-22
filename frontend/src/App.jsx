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
import { InGameWindow } from './components/game/inGameBoard/InGameWindow';
import { RoundTransition } from './components/game/createBoard/RoundTransition';
import { EndGameModal } from './components/EndGameModal';

function App() {
    const [user, setUser] = useState({});
    const [users, setUsers] = useState({});
    const [messages, setMessages] = useState([]);
    const [tmp_msg, setTmp_msg] = useState('');

    const [showLogin, setShowLogin] = useState(true);
    const closeShowLogin = () => setShowLogin(false);
    const openShowLogin = () => setShowLogin(true);

    const [showInviteWindow, setShowInviteWindow] = useState(false);
    const closeInviteWindow = () => setShowInviteWindow(false);

    const [showCreateBoard, setShowCreateBoard] = useState(false);
    const openCreateBoard = () => setShowCreateBoard(true);
    const closeCreateBoard = () => setShowCreateBoard(false);

    const [showInGameWindow, setShowInGameWindow] = useState(false);
    const openInGameWindow = () => {
        closeCreateBoard();
        setShowInGameWindow(true);
    };
    const closeInGameWindow = () => setShowInGameWindow(false);

    const [showRoundTransition, setShowRoundTransition] = useState(false);
    const closeTransition = () => setShowRoundTransition(false);

    const [showEndGameModal, setShowEndGameModal] = useState(false);
    const closeShowEndGameModal = () => setShowEndGameModal(false);

    useEffect(() => {
        // Ping ///////////////////////////////////////////////
        socket.on('pingToClient', payload => {
            // console.log(payload);
        });
        setInterval(() => {
            socket.emit('pingToServer', 'Ping!');
        }, 20000);
        //////////////////////////////////////////////////////

        socket.on('onConnection', () => {
            closeCreateBoard();
            closeInGameWindow();
            closeInviteWindow();
            closeTransition();
            closeShowEndGameModal();
            openShowLogin();
        });

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
            setShowInviteWindow(false);
        });

        socket.on('startGame', () => {
            console.log('StartGame');
            openInGameWindow();
            socket.emit('fetchBoard');
            socket.emit('fetchUser');
        });

        socket.on('nextRound', msg => {
            socket.emit('fetchUser');
            closeInGameWindow();
            setShowRoundTransition(true);
            setTmp_msg(msg);
        });

        socket.on('finishGame', msg => {
            socket.emit('fetchUser');
            closeCreateBoard();
            closeInGameWindow();
            setShowEndGameModal(true);
            if (msg === 'oppDisconnect') {
                setTmp_msg(`Your opponent disconnect. Your MMR +1.`);
            } else {
                setTmp_msg(`You ${msg} this game.`);
            }
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
                                {/* <div>{Object.values(users)}</div> */}
                                <div>{<MyStatusBox user={user} />}</div>
                                {showEndGameModal && (
                                    <EndGameModal
                                        user={user}
                                        msg={tmp_msg}
                                        close={closeShowEndGameModal}
                                    ></EndGameModal>
                                )}
                                {showRoundTransition && (
                                    <RoundTransition
                                        user={user}
                                        msg={tmp_msg}
                                        openCreateBoard={openCreateBoard}
                                        closeTransition={closeTransition}
                                    ></RoundTransition>
                                )}
                                {}
                                {showCreateBoard && <CreateBoard user={user}></CreateBoard>}
                                {showInGameWindow && (
                                    <InGameWindow
                                        user={user}
                                        close={closeInGameWindow}
                                    ></InGameWindow>
                                )}
                                {showLogin && <LoginModal close={closeShowLogin} />}
                                <div className='main'>
                                    {user.status === 'ONLINE' && (
                                        <OnlinePlayersTab
                                            user={user}
                                            users={users}
                                        ></OnlinePlayersTab>
                                    )}
                                    <div style={{ width: '10px' }}></div>
                                    {user.status === 'ONLINE' && <LobbyChat messages={messages} />}
                                </div>
                                {showInviteWindow && (
                                    <InviteWindow
                                        close={closeInviteWindow}
                                        user={user}
                                        users={users}
                                    />
                                )}
                            </header>
                        </div>
                    </Route>
                </Switch>
            </Router>
        </>
    );
}

export default App;
