import { Socket } from "socket.io-client"

function App(props: {socket : Socket}) {

  return (
    <div>
      Click the button to emit an event
      <button 
        onClick={() => {
          props.socket.emit("clicked", "I have clicked the button!")
        }} 
        content="Click me!"
        />
    </div>
  )
}

export default App
