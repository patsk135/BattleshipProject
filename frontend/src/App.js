import React, { useState } from "react";
import logo from "./logo.svg";
import { Modal } from "./components/Modal";
import "./App.css";

function App() {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState("");
  const handleInput = event => {
    setValue(event.target.value);
  };
  const open = () => {
    setShow(true);
  };
  const close = () => {
    setShow(false);
  };
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <label>
          Name:
          <input type="text" value={value} onChange={handleInput} />
        </label>
        <button onClick={open}>show</button>
        {show && <Modal message={value} close={close} />}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
