import React from 'react';

export const RoundTransition = ({ user, msg, openCreateBoard, closeTransition }) => {
    const onClickHandler = () => {
        closeTransition();
        openCreateBoard();
    };
    return (
        <div>
            You {msg}. Your score is {user.score}
            <button onClick={onClickHandler}>Next Round.</button>
        </div>
    );
};
