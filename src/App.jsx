import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import lowesLogo from './assets/loweslogo.png';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [activeButton, setActiveButton] = useState('star');
  const [recentChats, setRecentChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [editingChatIndex, setEditingChatIndex] = useState(null);
  const [editingChatName, setEditingChatName] = useState('');
  const [feedback, setFeedback] = useState({});
  const messagesEndRef = useRef(null);

  // Save current chat messages when they change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      const updatedChats = recentChats.map(chat => 
        chat.id === currentChatId ? { ...chat, messages } : chat
      );
      setRecentChats(updatedChats);
    }
  }, [messages, currentChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const sendMessage = async (messageText = null) => {
    console.log('sendMessage called with:', messageText);
    const textToSend = messageText || input;
    console.log('textToSend:', textToSend, 'type:', typeof textToSend);
    if (!textToSend || typeof textToSend !== 'string' || !textToSend.trim()) return;

    // Create a new chat if none exists
    if (!currentChatId) {
      const newChat = {
        id: Date.now().toString(),
        name: `Chat ${recentChats.length + 1}`,
        messages: [],
        timestamp: new Date().toISOString()
      };
      setRecentChats(prev => [...prev, newChat]);
      setCurrentChatId(newChat.id);
      setMessages([]);
    }

    // Block email address requests
    const emailKeywords = ['email', 'e-mail', 'mail address', 'email address', '@', 'contact email'];
    const lowerText = textToSend.toLowerCase();
    if (emailKeywords.some(keyword => lowerText.includes(keyword))) {
      setMessages(prev => [...prev,
        { role: 'user', content: textToSend },
        { role: 'assistant', content: 'I cannot provide email addresses. Please visit the official Launchpad website for contact information.' }
      ]);
      setInput('');
      setHasStartedChat(true);
      return;
    }

    const userMessage = {
      role: 'user',
      content: textToSend
    };
    console.log('Adding user message:', userMessage);

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setHasStartedChat(true);
    setIsThinking(true);

    try {
      console.log('Sending request to backend...');
      const response = await fetch('http://127.0.0.1:8000/generate', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: textToSend,
          variant: "concise",
          top_k: 5
        })

      });

      console.log('Response received:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.error('Backend error:', data);
        const errorMessage = data.detail || (typeof data === 'object' ? JSON.stringify(data) : 'Unknown error from backend');
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Error: ${errorMessage}`
          }
        ]);
        return;
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || 'No answer received'
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
    const newChat = {
      id: Date.now().toString(),
      name: `Chat ${recentChats.length + 1}`,
      messages: [],
      timestamp: new Date().toISOString()
    };
    setRecentChats([...recentChats, newChat]);
    setCurrentChatId(newChat.id);
    setMessages([]);
    setHasStartedChat(true);
    setActiveButton('chat');
  };

  const loadChat = (chatId) => {
    const chat = recentChats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages || []);
      setHasStartedChat(true);
      setActiveButton('chat');
    }
  };

  const resetToHome = () => {
    setMessages([]);
    setHasStartedChat(false);
    setActiveButton('star');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const startEditingChat = (index, currentName) => {
    setEditingChatIndex(index);
    setEditingChatName(currentName || recentChats[index]?.name || '');
  };

  const saveChatName = (index) => {
    const updatedChats = [...recentChats];
    updatedChats[index] = { ...updatedChats[index], name: editingChatName };
    setRecentChats(updatedChats);
    setEditingChatIndex(null);
    setEditingChatName('');
  };

  const cancelEditing = () => {
    setEditingChatIndex(null);
    setEditingChatName('');
  };

  const convertLinks = (text) => {
    if (!text || typeof text !== 'string') return text;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="message-link">${url}</a>`;
    });
  };

  const handleFeedback = async (messageIndex, feedbackType) => {
    // Update local state
    setFeedback(prev => ({
      ...prev,
      [messageIndex]: feedbackType
    }));

    // Send feedback to backend
    try {
      await fetch('http://127.0.0.1:8000/feedback', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messages[messageIndex].content,
          feedback: feedbackType,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  return (
    <div className="page">

      <aside className={`sidebar ${isSidebarExpanded ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <img src={lowesLogo} alt="Lowe's Logo" className="sidebar-logo-image" />
          <h2 className="sidebar-title">Launchpad Chatbot</h2>
        </div>

        <button 
          className="sidebar-toggle"
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        >
          {isSidebarExpanded ? '◀' : '▶'}
        </button>

        {isSidebarExpanded && (
          <>
            <button className="new-chat-button" onClick={startNewChat}>
              + New Chat
            </button>

            <div className="recent-chats">
              <h3 className="recent-chats-title">Recent Chats</h3>
              <ul className="recent-chats-list">
                {recentChats.map((chat, index) => (
                  <li key={chat.id} className="recent-chat-item">
                    {editingChatIndex === index ? (
                      <div className="chat-edit-wrapper">
                        <input
                          type="text"
                          value={editingChatName}
                          onChange={(e) => setEditingChatName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveChatName(index);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                          className="chat-name-input"
                          autoFocus
                        />
                        <button 
                          className="chat-save-btn"
                          onClick={() => saveChatName(index)}
                        >
                          ✓
                        </button>
                        <button 
                          className="chat-cancel-btn"
                          onClick={cancelEditing}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="chat-name-wrapper">
                        <span onClick={() => loadChat(chat.id)}>{chat.name}</span>
                        <button 
                          className="chat-rename-btn"
                          onClick={() => startEditingChat(index, chat.name)}
                        >
                          ✎
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="sidebar-footer">
              <button className="settings-button">Settings</button>
            </div>
          </>
        )}
      </aside>

      <main className="main-content" style={{ marginLeft: isSidebarExpanded ? '320px' : '120px' }}>

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
                {msg.role === 'assistant' ? (
                  <>
                    <span dangerouslySetInnerHTML={{ __html: convertLinks(msg.content) }} />
                    <div className="feedback-buttons">
                      <button
                        className={`feedback-btn ${feedback[i] === 'positive' ? 'active' : ''}`}
                        onClick={() => handleFeedback(i, 'positive')}
                        title="Helpful"
                      >
                        👍
                      </button>
                      <button
                        className={`feedback-btn ${feedback[i] === 'negative' ? 'active' : ''}`}
                        onClick={() => handleFeedback(i, 'negative')}
                        title="Not helpful"
                      >
                        👎
                      </button>
                    </div>
                  </>
                ) : (
                  msg.content
                )}
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
                onClick={() => { console.log('Button clicked'); sendMessage(); }}
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
