import React from "react";
import "./css/MyStatusBox.css";

export const MyStatusBox = ({ user }) => {
  return (
    <div className="myStatusBox">
      <li>UserName: {user.name}</li>
      <li>ID: {user.id}</li>
    </div>
  );
};
