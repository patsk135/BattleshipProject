import React from 'react';

export const EndGameModal = ({ user, msg, close }) => {
    return (
        <div>
            {msg} Now your MMR is {user.mmr}.<button onClick={close}>Ok.</button>
        </div>
    );
};
