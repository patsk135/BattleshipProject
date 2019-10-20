import React, { useState, useEffect } from 'react';
import { BoardSquare } from './BoardSquare';
import { socket } from '../../../socket';

export const InGameBoard = ({ boardStatus, isOwner, setOppBoard }) => {
    const [squares, setSquares] = useState([]);
    const [score, setScore] = useState(0);

    const handleSquareClick = i => {
        if (!isOwner && boardStatus.attackStatus[i] !== 1) {
            // console.log(`Attack position x:${x} y:${y}`);
            socket.emit('attackBoard', i);
            const { shipPlacement, attackStatus } = boardStatus;
            if (shipPlacement[i] === 1) {
                setScore(score + 1);
            }
            attackStatus[i] = 1;
            setOppBoard(prev => {
                return { ...prev, attackStatus };
            });
        } else {
            console.log(`Can't attack your own board.`);
        }
    };

    const renderSquare = i => {
        const x = i % 8;
        const y = Math.floor(i / 8);

        return (
            <div
                key={i}
                style={{
                    width: '12.5%',
                    height: '12.5%',
                    borderColor: 'black',
                    borderStyle: 'solid',
                }}
                onClick={e => handleSquareClick(i)}
            >
                {
                    <BoardSquare
                        isPlaced={boardStatus.shipPlacement[i] === 1 ? true : false}
                        isAttacked={boardStatus.attackStatus[i] === 1 ? true : false}
                        isOwner={isOwner}
                    ></BoardSquare>
                }
            </div>
        );
    };

    useEffect(() => {
        if (boardStatus !== null) {
            const tmp = new Array(64);
            for (let i = 0; i < 64; i++) {
                tmp.push(renderSquare(i));
            }
            setSquares(tmp);
        }
        if (score === 4) {
            setScore(0);
            console.log('You win.');
            socket.emit('winThisRound');
        }
    }, [boardStatus]);

    return (
        <div>
            <div
                style={{
                    width: '300px',
                    height: '300px',
                    display: 'flex',
                    flexWrap: 'wrap',
                }}
            >
                {squares}
            </div>
        </div>
    );
};
