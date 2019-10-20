import React, { useState, useEffect } from 'react';
import { socket } from '../../../socket';
import { InGameBoard } from './InGameBoard';

export const InGameWindow = ({ turn, setTurn, close }) => {
    const [turn_tmp, setTurn_tmp] = useState(0);
    const [yourBoard, setYourBoard] = useState(null);
    const [oppBoard, setOppBoard] = useState(null);

    useEffect(() => {
        socket.on('receiveFetchBoard', payload => {
            console.log('in fetchBoard');
            console.log(payload);
            setYourBoard(payload.yourBoard.status);
            // setOppBoard(payload.oppBoard.status);
        });
    }, []);

    return <div>{<InGameBoard boardStatus={yourBoard} isOwner={true}></InGameBoard>}</div>;
};
