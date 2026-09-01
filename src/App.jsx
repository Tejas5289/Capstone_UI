import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input
    };
    console.log(input)

    setMessages([...messages, userMessage]);
    setInput('');

    try {
      const response = await fetch('http://127.0.0.1:8000/generate', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "question": input, "variant": "concise", "top_k":3})
        
      });

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer
        }
      ]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
<div className="page">

  <header className="site-header">
    <div className= "side-nav">
      <div className="site-logo">
        <img id="logo" src="/LP_logo.png" alt="Lowes Logo" />
      </div>
    </div>
  </header>

  <main className="main-content">

    <div className="chat-container">

      <div className="chat-header">
          <div className="brand">
            <div className="logo">✦</div>
            <span>LAUNCHPAD CHATBOT</span>
          </div>

          <div className="status">
            <span className="status-dot"></span>
            Online
          </div>
        </div>

        <div className="chat-intro">
          <h1>How can I help you today?</h1>
          <p>
            Ask me anything about Launchpad and I'll do my best to help.
          </p>
        </div>

        <div className="messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${msg.role}`}
            >
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
            placeholder="Type your message..."
          />

          <button onClick={sendMessage}>
            Send
          </button>
        </div>

      </div>

    </main>

    </div>
  );
}

export default App;