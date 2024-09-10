import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaInfoCircle, FaComments, FaBook, FaTimes, FaTrash  } from 'react-icons/fa';

interface SidebarProps {
  chats: { id: string; name: string; messages: { type: string; content: string }[], tokens: number, cost: number }[];
  setChats: React.Dispatch<React.SetStateAction<{ id: string; name: string; messages: { type: string; content: string }[], tokens: number, cost: number }[]>>;
  userName: string; // Added userName prop
}

const Sidebar: React.FC<SidebarProps> = ({ chats, setChats, userName }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const totalTokens = chats.reduce((acc, chat) => acc + chat.tokens, 0);
  const totalCost = chats.reduce((acc, chat) => acc + chat.cost, 0);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const startNewChat = () => {
    const newChat = {
      id: `chat-${chats.length + 1}`,
      name: `Chat ${chats.length + 1}`,
      messages: [],
      tokens: 0,
      cost: 0
    };
    setChats([...chats, newChat]);
    navigate(`/chat/${newChat.id}`);
  };

  const handleChatClick = () => {
    if (chats.length === 0) {
      startNewChat();
    } else {
      const lastChat = chats.slice(-1)[0];
      navigate(`/chat/${lastChat.id}`);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      const updatedChats = chats.filter((chat) => chat.id !== chatId);
      setChats(updatedChats);
  
    // If the deleted chat was the active chat, navigate to the overview or another chat.
    // if (updatedChats.length > 0) {
    //   navigate(`/chat/${updatedChats[0].id}`);
    // } else {
      navigate(`/`);  //for now let's take the user to overview page
    //}
    }
  };

  return (
    <div className={`bg-white shadow-md ${isCollapsed ? 'w-16' : 'w-64'} h-full relative transition-width duration-300 bg-gray-gradient`}>
      <div className="p-6 flex justify-between items-center">
        <button onClick={toggleSidebar} className="text-gray-800">
          <FaBars />
        </button>
        {!isCollapsed && (
        <div className="bg-white p-2 rounded-lg shadow-md">
        <img 
          src="/niams_logo.jpg" 
          alt="Logo" 
          className="h-8 w-auto mx-auto" 
        />
      </div>)}
      </div>
      <nav className="mt-6">
        <div className="flex flex-col">
          <Link to="/" className="text-blue-500 font-semibold hover:bg-gray-100 flex items-center py-3 px-4">
            <FaInfoCircle className="mr-2" />
            {!isCollapsed && <span>Overview</span>}
          </Link>
          <div className="text-blue-500 font-semibold hover:bg-gray-100 flex items-center py-3 px-4 cursor-pointer" onClick={handleChatClick}>
            <FaComments className="mr-2" />
            {!isCollapsed && <span>Chat</span>}
          </div>
          <div className="text-blue-500 font-semibold hover:bg-gray-100 flex items-center py-3 px-4 cursor-pointer" onClick={handleChatClick}>
            <FaBook className="mr-2" />
            {!isCollapsed && <span>Interactive Knowledge Base</span>}
          </div>
        </div>
      </nav>
      {!isCollapsed && (
        <>
          <hr className="my-2" />
          <div className="p-4">
            <button onClick={startNewChat} className="w-full bg-blue-500 text-white p-2 rounded mb-4">
              Start New Chat
            </button>
            <div className="mt-4">
              <span className="block text-gray-800 font-semibold text-xs">Logged in as: {userName}</span>
            </div>
            <div className="mt-4">
              <span className="block text-gray-800 font-semibold text-sm">Total Tokens for this session: {totalTokens}</span>
              <span className="block text-gray-800 font-semibold text-sm">Total Cost for this session: ${totalCost.toFixed(2)}</span>
            </div>
          </div>
          <div className="p-4">
            {chats.map((chat, index) => (
             <div key={chat.id} className="flex justify-between items-center hover:bg-gray-100 group">
             <Link to={`/chat/${chat.id}`} className="text-gray-800 font-semibold block py-2 px-4">
               {chat.name}
             </Link>
             <button
               onClick={() => handleDeleteChat(chat.id)}
               className="text-gray-500 hover:text-red-700 p-1 hidden group-hover:block"
             >
               <FaTrash />
             </button>
           </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
