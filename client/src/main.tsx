import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { io } from 'socket.io-client'

const target = import.meta.env.VITE_TARGET
if (target === undefined) {
    throw Error(
        'The process could not start because the environment variable for TARGET was not set propertly (undefined)'
    )
}
const socket = io('ws://' + target)

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App socket={socket} />
    </React.StrictMode>
)
