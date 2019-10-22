import React, { useState, useEffect } from 'react';
import { socket } from '../../../socket';
import { InGameBoard } from './InGameBoard';
import '../../css/InGameWindow.css';

export const InGameWindow = ({ user, users }) => {
    const [start, setStart] = useState(false);
    const [yourBoard, setYourBoard] = useState(null);
    const [oppBoard, setOppBoard] = useState(null);
    const [oppScore, setOppScore] = useState(0);
    const [yourScore, setYourScore] = useState(0);
    const [timer, setTimer] = useState(10);

    const increaseYourHit = () => {
        setYourScore(yourScore + 1);
    };

    useEffect(() => {
        socket.on('receiveFetchBoard', payload => {
            console.log('in fetchBoard');
            console.log(payload);
            setYourBoard(payload.yourBoard.status);
            setOppBoard(payload.oppBoard.status);
            setTimer(10);
            setOppScore(0);
            setYourScore(0);
            setStart(true);
        });

        socket.on('updateYourBoard', payload => {
            console.log('in updateBoard');
            // console.log(payload);
            setYourBoard(payload.yourBoard.status);
            setTimer(10);
        });

        socket.on('increaseOppHit', () => {
            console.log('in increaseOppHit');
            setOppScore(oppScore => oppScore + 1);
        });
    }, []);

    useEffect(() => {
        if (timer === 0) {
            socket.emit('attackBoard', -1);
        }
        const intervalId = setInterval(() => {
            setTimer(timer - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timer]);

    useEffect(() => {}, []);

    return (
        <div>
            {user.yourTurn && <div>Timer: {timer}</div>}
            {!user.yourTurn && <div>Waiting</div>}
            <div className={`boards ${!user.yourTurn && 'avoid-clicks'}`}>
                <div>
                    Your Board
                    {start && (
                        <InGameBoard
                            name={user.name}
                            boardStatus={yourBoard}
                            hit={yourScore}
                            isOwner={true}
                        ></InGameBoard>
                    )}
                </div>
                <div
                    style={{
                        width: '15px',
                    }}
                ></div>
                <div>
                    Opponent Board
                    {start && (
                        <InGameBoard
                            name={users[user.oppId].name}
                            boardStatus={oppBoard}
                            hit={oppScore}
                            isOwner={false}
                            setOppBoard={setOppBoard}
                            increaseYourHit={increaseYourHit}
                        ></InGameBoard>
                    )}
                </div>
            </div>
        </div>
    );
};
