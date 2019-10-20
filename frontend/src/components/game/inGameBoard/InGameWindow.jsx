import React, { useState, useEffect } from 'react';
import { socket } from '../../../socket';
import { InGameBoard } from './InGameBoard';
import '../../css/InGameWindow.css';

export const InGameWindow = ({ user }) => {
    const [yourBoard, setYourBoard] = useState(null);
    const [oppBoard, setOppBoard] = useState(null);

    useEffect(() => {
        socket.on('receiveFetchBoard', payload => {
            console.log('in fetchBoard');
            console.log(payload);
            setYourBoard(payload.yourBoard.status);
            setOppBoard(payload.oppBoard.status);
        });
        socket.on('updateYourBoard', payload => {
            console.log('in updateBoard');
            setYourBoard(payload.yourBoard.status);
        });
    }, []);

    return (
        <div className={`boards ${!user.yourTurn && 'avoid-clicks'}`}>
            <div>
                Your Board{<InGameBoard boardStatus={yourBoard} isOwner={true}></InGameBoard>}
            </div>
            <div
                style={{
                    width: '15px',
                }}
            ></div>
            <div>
                Opponent Board
                {
                    <InGameBoard
                        boardStatus={oppBoard}
                        isOwner={false}
                        setOppBoard={setOppBoard}
                    ></InGameBoard>
                }
            </div>
        </div>
    );
};
