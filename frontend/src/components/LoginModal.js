import React, { useState } from "react";
import { socket } from "../socket";
import "./css/LoginModal.css";

export const LoginModal = ({ submit }) => {
  const [name, setName] = useState("");
  const handleInput = event => {
    setName(event.target.value);
  };
  const onClick = () => {
    socket.emit("createUser", name, returnedUser => {
      if (returnedUser.message === undefined) {
        // console.log(returnedUser);
        submit(returnedUser);
      } else {
        console.log("err createuser");
        console.log(returnedUser);
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
