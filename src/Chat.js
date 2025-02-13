import "./Chat.css";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:9000", { autoConnect: false });

export default function Chat() {
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const msgBodyRef = useRef(null);

  useEffect(() => {
    if (msgBodyRef.current) {
      msgBodyRef.current.scrollTop = msgBodyRef.current.scrollHeight;
    }
  }, [messages]); // Runs every time messages update

  useEffect(() => {
    // Fetch initial data
    Promise.all([
      axios.get("http://localhost:9000/api/students"),
      axios.get("http://localhost:9000/api/messages"),
    ])
      .then(([studentRes, messageRes]) => {
        setStudents(studentRes.data);
        setMessages(messageRes.data);
      })
      .catch((error) => console.error("Error fetching data:", error));

    // Connect to socket only once
    socket.connect();

    // Listen for new messages
    socket.on("receiveMessage", (newMessage) => {
      // console.log("🔍 Message received:", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      // console.log("🔄 Cleanup: Removing event listener");
      socket.off("receiveMessage");
    };
  }, []);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    console.log("Sending message:", message); // 🔍 Debugging
    // Emit message via Socket.IO only (no need for axios POST)
    socket.emit("sendMessage", message);

    setMessage(""); // Clear input field
  };

  return (
    <div className="main">
      <div className="msgBody" ref={msgBodyRef}>
        <h3>Chat Messages:</h3>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          onChange={handleMessageChange}
          type="text"
          placeholder="Enter your message"
          value={message}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
