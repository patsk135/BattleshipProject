import React from 'react';
import { socket } from "../socket.js";
import "./css/AdminPage.css";

export const AdminPage = () => {

  return (

    <div>

      <div class="adminPageHeader">
        <li>This is admin page</li>
        <li>UserName:</li>
        <li>ID:</li>
        <li>Status: Admin</li>
      </div>

      <div class="adminPagePlayers">
        <ul align="center">Number of players online: </ul>
        <ul align="center">Number of games playing: </ul>
        <h1 align="center">Players in the server</h1>
        <div class="adminPagePlayersPool">
          <li></li>
        </div>
      </div>

      <div class="adminPageStatusBoard">
        <div class="adminPageStatus">
          <ul>Game No.</ul>
          <ul>Player1</ul>
          <ul>Score</ul>
          <ul>Player2</ul>
          <ul>Status</ul>
          <ul>Reset</ul>
        </div>
        <div class="adminPageStatus">
          <ul></ul>
          <ul></ul>
          <ul> : </ul>
          <ul></ul>
          <ul></ul>
          <ul>
            <button class="resetBtn">Reset Game</button>
          </ul>
        </div>
      </div>

    </div>
    
  );

};
