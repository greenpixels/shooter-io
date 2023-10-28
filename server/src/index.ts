import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('clicked', (text) => {
    console.log(text);
  });
});

server.listen(8080, () => {
  console.log('server running at http://localhost:3000');
});