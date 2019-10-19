import React from "react";
import { socket } from "../socket.js";
import "./css/InviteWindow.css";

export const InviteWindow = ({ close, user }) => {
  const accept = () => {
    if (user.status === "ONLINE") {
      socket.emit("acceptInvitation", user.oppId, data => {
        console.log(data);
      });
    }
    close();
  };
  const reject = () => {
    close();
  };

  return (
    <div className="inviteWindow">
      <label>Invitation from Someone</label>
      <div className="buttons">
        <li>
          <button onClick={accept}>Accept</button>
        </li>
        <li>
          <button onClick={reject}>Reject</button>
        </li>
      </div>
    </div>
  );
};
