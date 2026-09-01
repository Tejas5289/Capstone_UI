import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import lowesLogo from './assets/loweslogo.png';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [activeButton, setActiveButton] = useState('star');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage = {
      role: 'user',
      content: textToSend
    };
    console.log(textToSend)

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setHasStartedChat(true);
    setIsThinking(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/generate', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "question": textToSend, "variant": "concise", "top_k":3})

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

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong.'
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const sendMessageWithText = (text) => {
    sendMessage(text);
  };

  const startNewChat = () => {
    setMessages([]);
    setHasStartedChat(true);
    setActiveButton('chat');
  };

  const resetToHome = () => {
    setMessages([]);
    setHasStartedChat(false);
    setActiveButton('star');
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

        <div className="sidebar-buttons">
          <button
            className={`sidebar-button ${activeButton === 'star' ? 'active' : ''}`}
            onClick={resetToHome}
          >
            ✦
          </button>

          <button
            className={`sidebar-button ${activeButton === 'chat' ? 'active' : ''}`}
            onClick={startNewChat}
          >
            💬
          </button>
        </div>

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
                <button onClick={() => sendMessageWithText("What is Launchpad?")}>What is Launchpad?</button>
                <button onClick={() => sendMessageWithText("How to apply?")}>How to apply?</button>
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
            {isThinking && (
              <div className="message assistant thinking">
                <div className="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
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
