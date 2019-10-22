import React from 'react';
import './css/UserStatusBar.css';

export const UserStatusBar = ({ user }) => {
  return (
    <div className='myHelloBox'>
      <div className='profile-container'>
        <div className='avatar'>
          <img src='/logo192.png' alt=""/>
        </div>
        <p className='hello'>Hello, {user.name}</p>
        <p className='MMR'>MMR: {user.mmr}</p>
        <p className='status'>{user.status}</p>
      </div>
      <div className='buttons-container'>
        <button className='primaryButton'>Ready</button>
        <button className='secondaryButton'>Logout</button>
      </div>
    </div>
  );
};
