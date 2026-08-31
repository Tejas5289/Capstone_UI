import React, { useState} from 'react'; // this is a react hook
import './App.css'; // this is a css file

function App() {
    const [messages, setMessages] = useState([]); //this is a state variable that stores the messages
    const [input, setInput] = useState(''); //this is a state variable that stores the input

    const sendMessage = async () => { //this is a function that sends a message
      if (!input.trim()) return; // if it doesnt have any text, it returns. trim() removes whitespace from the input
      const userMessage = { role: 'user', content: input }; // this creates a message object with the user's input
      setMessages([...messages, userMessage]); // this adds the user's message to the messages array
      setInput(''); // this clears the input, another words, sets it to an empty string

      try { // try to send the message
        const response = await fetch('http://localhost:3000/api/chat',{ // this fetches the api
          method: 'POST', // POST does a post request to the api
          headers: { 'Content-Type': 'application/json' }, // this sets the content type to json
          body: JSON.stringify({message: input}) // this sends the message as a json string
        });
        const data = await response.json();   // this parses the response as json
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply}]); // this adds the assistant's message to the messages array
      } catch (error) { // if there is an error
        console.error('Error;', error); // log the error
      }
    };

    const handleKeyPress = (e) => { // this is a function that handles the key press
      if (e.key === 'Enter') sendMessage(); // if the key is enter, send the message
    };

    return (
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, i ) => (
            <div key={i} className={`message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>

      </div>
    );
}

export default App;

