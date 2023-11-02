import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { io } from 'socket.io-client'

const socket = io("ws://localhost:8080")

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App socket={socket} />
  </React.StrictMode>,
)
