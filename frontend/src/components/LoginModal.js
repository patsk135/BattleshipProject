import React, { useState } from "react";
import { socket } from "../socket";
import "./css/LoginModal.css";

export const LoginModal = ({ close }) => {
  const [name, setName] = useState("");
  const handleInput = event => {
    setName(event.target.value);
  };
  const onClick = () => {
    socket.emit("createUser", name, err => {
      if (err) {
        console.log(err);
      } else {
        close();
      }
    });
  };
  return (
    <div className="loginModal">
      <label>
        Input Name:
        <input type="text" value={name} onChange={handleInput} />
      </label>
      <div>Name: {name}</div>
      <div>
        <button onClick={onClick}>submit</button>
      </div>
    </div>
  );
};
