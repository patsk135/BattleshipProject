import React, { useState } from 'react';
import './css/ModeBox.css';

export const ModeBox = ({ mode, setMode }) => {
    const handleOnSelect = event => {
        console.log('in OnSelect');
        setMode(event.target.value);
    };

    const modes = ['mode1', 'mode2', 'mode3', 'mode4', 'mode5'];
    const modeNames = ['Ocean', 'Violet', 'Sky', 'Rose', 'Pale'];

    return (
        <form className='ModeBox'>
            <label>Select Mode</label>
            <div>
                {modes.map((bg, index) => {
                    return (
                        <ul>
                            <input
                                type='radio'
                                name='mode'
                                value={bg}
                                checked={mode === bg}
                                onChange={handleOnSelect}
                            />
                            &nbsp; {modeNames[index]}
                        </ul>
                    );
                })}
            </div>
        </form>
    );
};
