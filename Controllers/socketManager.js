const { Server } = require('socket.io');

const connections = {};
const messages = {};
const nameMap = {};
const timeOnline = {};

const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // You may want to specify your frontend origin here
      methods: ['GET', 'POST'],
      allowedHeaders: ['*'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-call', (roomId, username) => {
      console.log(`${username} joined room: ${roomId}`);
      if (!connections[roomId]) connections[roomId] = [];
      connections[roomId].push(socket.id);
      nameMap[socket.id] = username || 'Unknown';
      timeOnline[socket.id] = new Date();
     const newUserName = nameMap[socket.id] || 'Someone';

connections[roomId].forEach((clientId) => {
  io.to(clientId).emit('user-joined', socket.id, connections[roomId], newUserName);
});


      // Send chat history to the newly joined user
      if (messages[roomId]) {
        messages[roomId].forEach((msg) => {
          io.to(socket.id).emit('chat-message', msg.data, msg.sender, msg['socket-id-sender']);
        });
      }
    });

    socket.on('signal', (toId, message) => {
      console.log(`Signal from ${socket.id} to ${toId}`);
      io.to(toId).emit('signal', socket.id, message);
    });

    socket.on('chat-message', (data, sender) => {
      const room = Object.keys(connections).find((key) => connections[key].includes(socket.id));
      if (room) {
        if (!messages[room]) messages[room] = [];
        messages[room].push({ sender, data, 'socket-id-sender': socket.id });

        connections[room].forEach((clientId) => {
          io.to(clientId).emit('chat-message', data, sender, socket.id);
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      const room = Object.keys(connections).find((key) => connections[key].includes(socket.id));
      const name = nameMap[socket.id] || 'Someone';

      if (room) {
        connections[room] = connections[room].filter((id) => id !== socket.id);
        connections[room].forEach((clientId) => {
          io.to(clientId).emit('user-left', socket.id, name);
        });

        if (connections[room].length === 0) delete connections[room];
      }

      delete nameMap[socket.id];
      delete timeOnline[socket.id];
    });
  });

  return io;
};

module.exports = { connectToSocket };
