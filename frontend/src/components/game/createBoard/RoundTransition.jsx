import React from 'react';
import './css/RoundTransition.css';

export const RoundTransition = ({ user, msg, openCreateBoard, closeTransition }) => {
    const onClickHandler = () => {
        closeTransition();
        openCreateBoard();
    };
    return (
        <div className='roundContainer'>
            <div id='tt'>
                You {msg}. Your score is {user.score}!{' '}
            </div>
            <button id='nextRound' onClick={onClickHandler}>
                Next Round.
            </button>
        </div>
    );
};
