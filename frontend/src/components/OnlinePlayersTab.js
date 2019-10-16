import React, { useState } from "react";
import "./css/OnlinePlayersTab.css";
import { socket } from "../socket";

export const OnlinePlayersTab = ({ user, users }) => {
  const onClick = () => {
    socket.emit();
  };

  return (
    <div>
      <ul className="nav">
        <li>Online Players</li>
        <li>Status</li>
        <li>Score</li>
      </ul>
      <div className="container">
        {Object.values(users).map(eachUser => (
          <ul key={eachUser.id}>
            <li>{eachUser.name}</li>
            <li>{eachUser.status}</li>
            <li>{eachUser.score}</li>
            <li>
              <button
                className={`inviteButton ${eachUser.status !== "ONLINE" &&
                  "disabled"}`}
                onClick={onClick}
              >
                invite
              </button>
            </li>
          </ul>
        ))}
      </div>
    </div>
  );
};
