import "./App.css";
import React, { useState } from "react";
import { socket } from "./socket";
// import logo from "./logo.svg";
import { LoginModal } from "./components/LoginModal";
import { OnlinePlayersTab } from "./components/OnlinePlayersTab";
import { InviteWindow } from "./components/InviteWindow";
import { MyStatusBox } from "./components/MyStatusBox";
// import { ModalHim } from "./components/ModalHim";

function App() {
  const [users, setUsers] = useState([]);
  socket.on("refreshOnlineUsers", res => {
    setUsers(res);
    console.log(users);
  });

  const [user, setUser] = useState({
    id: "",
    name: "",
    oppId: "",
    status: "",
    score: 0
  });
  socket.on("pingToClient", msg => {
    console.log(msg);
  });

  const [userId, setUserId] = useState("");

  setInterval(() => {
    // console.log("in ping");
    socket.emit("pingToServer", "Ping!");
  }, 15000);
  const [showLogin, setShowLogin] = useState(true);

  const submit = thisUser => {
    // const { id, name, oppId, status, score } = thisUser;
    // console.log(thisUser);
    setUser(thisUser);
    // setUser({
    //   id,
    //   name,
    //   oppId,
    //   status,
    //   score
    // });
    // console.log(user);
    // setUserId(thisUserId);
    setShowLogin(false);
  };

  const [showInviteWindow, setShowInviteWindow] = useState(false);
  const closeInviteWindow = () => {
    setShowInviteWindow(false);
  };
  socket.on("getInvitation", oppId => {
    console.log("Get Invitation");
    setShowInviteWindow(true);
  });

  return (
    <>
      <div className="App">
        <header className="App-header">
          <div>{<MyStatusBox user={user} />}</div>
          {showLogin && <LoginModal submit={submit} />}
          {<OnlinePlayersTab user={user} users={users}></OnlinePlayersTab>}
          {showInviteWindow && (
            <InviteWindow
              close={closeInviteWindow}
              user={user}
              setUser={setUser}
            />
          )}
        </header>
      </div>
    </>
  );
}

export default App;
