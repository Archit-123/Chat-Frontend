import "./Chat.css";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const BACKEND_URL = "https://chat-backend-kxt3.onrender.com";
const socket = io(BACKEND_URL, { autoConnect: false });

export default function Chat() {
  // const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const msgBodyRef = useRef(null);

  useEffect(() => {
    if (msgBodyRef.current) {
      msgBodyRef.current.scrollTop = msgBodyRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    Promise.all([
      // axios.get("http://localhost:9000/api/students"),
      axios.get(`${BACKEND_URL}/api/messages`),
    ])
      .then(([messageRes]) => {
        // setStudents(studentRes.data);
        setMessages(messageRes.data);
      })
      .catch((error) => console.error("Error fetching data:", error));

    socket.connect();

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    console.log("Sending message:", message);
    socket.emit("sendMessage", message);
    setMessage("");
  };

  return (
    <div className="main">
      <div className="main-child">
        <div className="msgBody" ref={msgBodyRef}>
          <div className="heading-parent">
            <h2>Chat Messages</h2>
          </div>
          <ul>
            {messages.map((msg, index) => (
              <div className="msgs" key={index}>
                <text>{msg}</text>
              </div>
            ))}
          </ul>
        </div>
        <div className="form-parent">
          <form onSubmit={handleSubmit}>
            <input
              onChange={handleMessageChange}
              type="text"
              placeholder="Enter your message"
              value={message}
            />
            <button className="btn" type="submit">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
