import React, { useState, useEffect } from 'react';
import { BoardSquare } from './BoardSquare';

export const InGameBoard = ({ boardStatus, isOwner }) => {
    const [squares, setSquares] = useState([]);

    const handleSquareClick = () => {};

    const renderSquare = i => {
        const x = i % 8;
        const y = Math.floor(i / 8);

        return (
            <div
                key={i}
                style={{ width: '12.5%', height: '12.5%' }}
                onClick={e => handleSquareClick(x, y)}
            >
                {boardStatus !== null && (
                    <BoardSquare
                        isPlaced={boardStatus.shipPlacement[i] === 1 ? true : false}
                        isAttacked={boardStatus.attackStatus[i] === 1 ? true : false}
                        isOwner={isOwner}
                    ></BoardSquare>
                )}
            </div>
        );
    };

    useEffect(() => {
        for (let i = 0; i < 64; i++) {
            setSquares(prev => [...prev, renderSquare(i)]);
        }
    }, []);
    return <div>{squares}</div>;
};
