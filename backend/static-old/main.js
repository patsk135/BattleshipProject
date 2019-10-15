const app = new Vue({
  el: '#app',
  data: {
    title: 'Nestjs Websockets Chat',
    name: '',
    text: '',
    messages: [],
    users: [],
    socket: null,
  },
  methods: {
    sendMessage() {
      if (this.validateInput()) {
        const message = {
          name: this.name,
          text: this.text,
        };
        // console.log('send msgToServer');
        this.socket.emit('msgToServer', message, res => {
          // console.log('Test Return: ');
          // console.log(res);
        });
        this.text = '';
      }
    },
    receivedMessage(message) {
      this.messages.push(message);
    },
    validateInput() {
      return this.name.length > 0 && this.text.length > 0;
    },
    ping() {
      this.socket.emit('pingToServer', 'ping', msg => {
        console.log(msg);
      });
    },
    clear() {
      this.messages = [];
    },
    createUser() {
      // console.log('in createUser');
      this.socket.emit('createUser', this.name);
    },
  },
  created() {
    this.socket = io('http://localhost:3000');
    this.socket.on('msgToClients', message => {
      // console.log('in msgToLobby');
      this.receivedMessage(message);
    });
    this.socket.on('refreshOnlineUsers', users => {
      // console.log(users);
      this.users = users;
    });
    setInterval(
      function() {
        this.ping();
      }.bind(this),
      15000
    );
  },
});
