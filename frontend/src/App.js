import "./App.css";
import React, { useState, useEffect } from "react";
import { socket } from "./socket";
// import logo from "./logo.svg";
import { LoginModal } from "./components/LoginModal";
import { OnlinePlayersTab } from "./components/OnlinePlayersTab";
import { InviteWindow } from "./components/InviteWindow";
import { MyStatusBox } from "./components/MyStatusBox";
import { LobbyChat } from "./components/LobbyChat";
// import { ModalHim } from "./components/ModalHim";

function App() {
  const [user, setUser] = useState({});
  const [users, setUsers] = useState({});
  const [messages, setMessages] = useState([]);

  const [showLogin, setShowLogin] = useState(true);
  const closeShowLogin = () => setShowLogin(false);

  const [showInviteWindow, setShowInviteWindow] = useState(false);
  const closeInviteWindow = () => setShowInviteWindow(false);

  useEffect(() => {
    // Ping ///////////////////////////////////////////////
    socket.on("pingToClient", data => {
      console.log(data);
    });
    setInterval(() => {
      socket.emit("pingToServer", "Ping!");
    }, 20000);
    //////////////////////////////////////////////////////

    socket.on("returnUpdatedUser", data => {
      console.log("ReturnUpdatedUser: ");
      console.log(data);
      setUser(data.user);
    });

    socket.on("refreshOnlineUsers", data => {
      console.log("RefreshOnlineUsers: ");
      // console.log(data);
      console.log(data);
      // console.log(users);
      setUsers(data.users);
    });

    socket.on("msgToClients", data => {
      setMessages(oldmsg => [...oldmsg, data.message]);
    });

    socket.on("getInvitation", ({ event, clientId }) => {
      console.log(`GetInvitation -> OppId: ${clientId}`);
      setShowInviteWindow(true);
      setUser(prevUser => {
        return {
          ...prevUser,
          oppId: clientId
        };
      });
    });
  }, []);

  return (
    <>
      <div className="App">
        <header className="App-header">
          <div>{<MyStatusBox user={user} />}</div>
          {showLogin && <LoginModal close={closeShowLogin} />}
          {<OnlinePlayersTab user={user} users={users}></OnlinePlayersTab>}
          {showInviteWindow && (
            <InviteWindow close={closeInviteWindow} user={user} />
          )}
          <div>{<LobbyChat messages={messages} />}</div>
        </header>
      </div>
    </>
  );
}

export default App;
