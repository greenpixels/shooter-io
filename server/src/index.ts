import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import { ServerGameHandler } from './ServerGameHandler';
import cors from 'cors';

const app = express();

app.use(cors());
app.options('http://localhost:3000', cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const gameHandler = new ServerGameHandler(io)

io.on('connection', (socket) => {
  gameHandler.addPlayer(socket)
});

server.listen(8080, () => {
  console.log('server running at http://localhost:8080');
});