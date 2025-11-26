import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Configuration';

const MessageList = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMessages(res.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div>
      <h1>Messages</h1>
      <ul>
        {messages.map((message) => (
          <li key={message.message_id}>
            <p>{message.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageList;