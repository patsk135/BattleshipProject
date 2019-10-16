import "./css/InviteWindow.css";
import React from "react";

export const InviteWindow = ({ close, user, setUser }) => {
  return (
    <div className="inviteWindow">
      <label>Invitation from Someone</label>
      <div className="buttons">
        <li>
          <button>Accept</button>
        </li>
        <li>
          <button>Reject</button>
        </li>
      </div>
    </div>
  );
};
