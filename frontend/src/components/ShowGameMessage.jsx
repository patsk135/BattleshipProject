import React from 'react';
import './css/ShowGameMessage.css';

export const ShowGameMessage = ({ gameMessage }) =>{
    return(
        <div>
            <p className="output">  {gameMessage} </p>  
        </div>
    );
};
