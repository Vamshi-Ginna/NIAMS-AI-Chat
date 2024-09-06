import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { sendMessage, summarizeFile } from '../api/api';

interface Message {
  type: string;
  content: string;
  message_id?: string;
  isLoading?: boolean;
  isNew?: boolean;
}

interface ChatProps {
  chats: { id: string; name: string; messages: Message[], tokens: number, cost: number }[];
  setChats: React.Dispatch<React.SetStateAction<{ id: string; name: string; messages: Message[], tokens: number, cost: number }[]>>;
}

const Chat: React.FC<ChatProps> = ({ chats, setChats }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chat = chats.find(chat => chat.id === id);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id && chats.length === 0) {
      const newChat = {
        id: `chat-${chats.length + 1}`,
        name: `Chat ${chats.length + 1}`,
        messages: [],
        tokens: 0,
        cost: 0
      };
      setChats([...chats, newChat]);
      navigate(`/chat/${newChat.id}`);
    }
  }, [id, chats, setChats, navigate]);

  if (!chat) {
    return <div>Chat not found</div>;
  }

  const handleSendMessage = async (message: string) => {
    // Add user message to the chat
    const updatedChats = chats.map(chat => {
      if (chat.id === id) {
        return {
          ...chat,
          messages: [...chat.messages, { type: 'user', content: message, isNew: true }]
        };
      }
      return chat;
    });
    setChats(updatedChats);

    // Add loading state for the assistant's response
    const updatedChatsWithLoading = updatedChats.map(chat => {
      if (chat.id === id) {
        return {
          ...chat,
          messages: [...chat.messages, { type: 'assistant', content: '...', isLoading: true, isNew: true }]
        };
      }
      return chat;
    });
    setChats(updatedChatsWithLoading);

    setIsLoading(true);

    try {
      // Send message to the backend and capture the response
      const response = await sendMessage(message, chat.messages);

      // Update the messages with the actual response and attach the message_id from the backend
      const updatedChatsWithResponse = updatedChatsWithLoading.map(chat => {
        if (chat.id === id) {
          return {
            ...chat,
            messages: chat.messages.map((msg, index) =>
              msg.isLoading
                ? { type: 'assistant', content: response.response, isNew: true, message_id: response.message_id } // Attach message_id to the assistant's message
                : { ...msg, isNew: false }
            ),
            tokens: chat.tokens + response.tokens,
            cost: chat.cost + response.cost
          };
        }
        return chat;
      });
      setChats(updatedChatsWithResponse);
    } catch (error) {
      // Handle error
      const updatedChatsWithError = updatedChatsWithLoading.map(chat => {
        if (chat.id === id) {
          return {
            ...chat,
            messages: chat.messages.map(msg =>
              msg.isLoading ? { type: 'assistant', content: 'Error: Unable to fetch response', isNew: false } : msg
            )
          };
        }
        return chat;
      });
      setChats(updatedChatsWithError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (file: File) => {
    if (file && chat) {
      const message = `Generating File Summary for ${file.name}`;
      const updatedChats = chats.map(c => {
        if (c.id === chat.id) {
          return {
            ...c,
            messages: [...c.messages, { type: 'user', content: message, isNew: true }]
          };
        }
        return c;
      });
      setChats(updatedChats);

      const updatedChatsWithLoading = updatedChats.map(c => {
        if (c.id === chat.id) {
          return {
            ...c,
            messages: [...c.messages, { type: 'assistant', content: '...', isLoading: true, isNew: true }]
          };
        }
        return c;
      });
      setChats(updatedChatsWithLoading);

      setIsLoading(true);

      try {
        const summary = await summarizeFile(file);
        const updatedChatsWithResponse = updatedChatsWithLoading.map(c => {
          if (c.id === chat.id) {
            return {
              ...c,
              messages: c.messages.map(msg => 
                msg.isLoading
                  ? { type: 'assistant', content: `Summary of ${file.name}: ${summary}`, isNew: true }
                  : { ...msg, isNew: false }
              )
            };
          }
          return c;
        });
        setChats(updatedChatsWithResponse);
      } catch (error) {
        const updatedChatsWithError = updatedChatsWithLoading.map(c => {
          if (c.id === chat.id) {
            return {
              ...c,
              messages: c.messages.map(msg =>
                msg.isLoading ? { type: 'assistant', content: 'Error: Unable to fetch summary', isNew: false } : msg
              )
            };
          }
          return c;
        });
        setChats(updatedChatsWithError);
        console.error('Error summarizing file:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleThumbsDown = (message: string) => {
    console.log('Thumbs down clicked for message:', message);
    // Implement feedback submission logic here
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="token-info absolute top-0 left-0 m-2 p-2 bg-gray-100 rounded shadow">
        <span>Current Chat - </span>
        <span>Tokens: {chat.tokens}</span>
        <span> Cost: ${chat.cost.toFixed(2)}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {chat.messages.map((msg, index) => (
          <ChatMessage
            key={index}
            message={msg}
            type={msg.type}
            isLoading={msg.isLoading}
            isNew={msg.isNew || false} // Ensure the isNew prop is passed correctly
            onThumbsDown={handleThumbsDown}
          />
        ))}
      </div>
      <ChatInput onSendMessage={handleSendMessage} onFileChange={handleFileChange} />
    </div>
  );
};

export default Chat;
