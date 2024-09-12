import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { sendMessage, summarizeFile } from '../api/api';
import PromptsAndInteractions from '../components/PromptsAndInteractions'; 

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
  const [showPrompts, setShowPrompts] = useState(true); // State to control showing the prompts

  // Initialize a new chat if no chat is found or the current chat is invalid
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

  // Return if the chat is not found
  if (!chat) {
    return <div>Chat not found</div>;
  }

  // Function to handle sending messages
  const handleSendMessage = async (message: string) => {
    setShowPrompts(false); // Hide prompts once the user sends a message
    setIsLoading(true);
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

    // Show loading state for assistant response
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

    try {
      // Send message to backend and receive response
      const response = await sendMessage(message, chat.messages);
      const updatedChatsWithResponse = updatedChatsWithLoading.map(chat => {
        if (chat.id === id) {
          return {
            ...chat,
            messages: chat.messages.map(msg =>
              msg.isLoading
                ? { type: 'assistant', content: response.response, isNew: true, message_id: response.message_id }
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
      // Handle error during message sending
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

  // Function to handle file uploads
  const handleFileChange = async (file: File) => {
    const allowedExtensions = ['pdf', 'json', 'docx', 'txt', 'md', 'xml'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

    if (file && chat) {
      const userMessage = `File: ${file.name}`;
      const updatedChats = chats.map(c => {
        if (c.id === chat.id) {
          return {
            ...c,
            messages: [...c.messages, { type: 'user', content: userMessage, isNew: true }]
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

      // Handle file processing
      if (allowedExtensions.includes(fileExtension)) {
        try {
          const summary = await summarizeFile(file);
          const updatedChatsWithResponse = updatedChatsWithLoading.map(c => {
            if (c.id === chat.id) {
              return {
                ...c,
                messages: c.messages.map(msg =>
                  msg.isLoading ? { type: 'assistant', content: summary, isNew: true } : { ...msg, isNew: false }
                )
              };
            }
            return c;
          });
          setChats(updatedChatsWithResponse);
        } catch (error) {
          // Error handling for file processing
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
        } finally {
          setIsLoading(false);
        }
      } else {
        // Handle unsupported file types
        const errorMessage = `Invalid file type: ${file.name}. Please upload a valid file of type: .pdf, .json, .docx, .txt, .md, or .xml.`;
        const updatedChatsWithError = updatedChatsWithLoading.map(c => {
          if (c.id === chat.id) {
            return {
              ...c,
              messages: c.messages.map(msg =>
                msg.isLoading ? { type: 'assistant', content: errorMessage, isNew: true } : { ...msg, isNew: false }
              )
            };
          }
          return c;
        });
        setChats(updatedChatsWithError);
      }
    }
  };

  // Handle thumbs down feedback
  const handleThumbsDown = (message: string) => {
    console.log('Thumbs down clicked for message:', message);
    // Implement feedback submission logic here
  };

  return (
    <div className="bg-gray-100 flex flex-col h-full relative">
      <div className="token-info absolute top-0 left-0 m-2 p-2 bg-gray-100 rounded shadow">
        <span className="font-bold">{chat.name} - </span>
        <span>Tokens: {chat.tokens}</span>
        <span> Cost: ${chat.cost.toFixed(2)}</span>
      </div>
   
      {/* Center the PromptsAndInteractions */}
      {showPrompts && (
        <div className="flex flex-1 items-center justify-center">
         <PromptsAndInteractions onCardClick={(message: string) => handleSendMessage(message)} />

        </div>
      )}


      {/* Chat Messages Section */}
      <div className="flex-1 overflow-y-auto p-4">
        {chat.messages.map((msg, index) => (
          <ChatMessage
            key={index}
            message={msg}
            type={msg.type}
            isLoading={msg.isLoading}
            isNew={msg.isNew || false}
            onThumbsDown={handleThumbsDown}
          />
        ))}
      </div>

      {/* Chat Input */}
      <ChatInput onSendMessage={handleSendMessage} onFileChange={handleFileChange} />
    </div>
  );
};

export default Chat;
