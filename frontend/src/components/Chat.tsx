import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import "./Chat.css"; 

const secretKey = process.env.SECRET_KEY || "saurabh-key";

// Encryption
const encryptMessage = (message: string): string => {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
};

// Decryption
const decryptMessage = (encryptedMessage: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const Chat: React.FC = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<{ text: string; type: string }[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onmessage = (event) => {
      const decryptedMessage = decryptMessage(event.data);
      setMessages((prev) => [...prev, { text: decryptedMessage, type: "received" }]);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws && message) {
      const encryptedMessage = encryptMessage(message);
      ws.send(encryptedMessage);
      setMessages((prev) => [...prev, { text: message, type: "sent" }]); 
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage(); 
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Saurabh's Secure Messaging App</h1>
      </header>
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.type === "sent" ? "sent" : "received"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown} 
          placeholder="Type your message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;

