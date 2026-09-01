import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import lowesLogo from './assets/loweslogo.png';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setHasStartedChat(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply
        }
      ]);
    } catch (error) {
      console.error('Error:', error);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong.'
        }
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="page">

      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={lowesLogo} alt="Lowe's Logo" className="sidebar-logo-image" />
        </div>

        <button className="sidebar-button active">
          ✦
        </button>

        <button className="sidebar-button">
          💬
        </button>

        {/* <button className="sidebar-button">
          ⚙
        </button> */}

        <button className="sidebar-button sidebar-bottom">
          ↪
        </button>
      </aside>

      <main className="main-content">

        <section className="hero">

          <div className="chat-status">
            <span className="status-dot"></span>
            Launchpad Assistant
          </div>

          {!hasStartedChat && (
            <>
              <h1>
                How can I help you<br />
                today?
              </h1>

              <p>
                Ask me anything about Launchpad and I'll do my best to help.
              </p>

              <div className="quick-actions">
                <button>What is Launchpad?</button>
                <button>How to apply?</button>
                {/* <button>Common Questions</button> */}
                {/* <button>Help Me</button> */}
              </div>
            </>
          )}

          <div className={`messages ${hasStartedChat ? 'messages-expanded' : ''}`}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.role}`}
              >
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-wrapper">

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything..."
            />

            <div className="input-actions">
              <button className="secondary-button">
                Attach
              </button>

              <button
                className="send-button"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default App;