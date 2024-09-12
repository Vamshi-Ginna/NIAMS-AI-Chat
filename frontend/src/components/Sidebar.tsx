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
    <div className={`bg-pinkish shadow-lg ${isCollapsed ? 'w-16' : 'w-64'} h-full relative transition-all duration-300 ease-in-out`}>
      <div className="p-6 flex justify-between items-center border-b border-pinkish_dark">
        <button onClick={toggleSidebar} className="text-white hover:text-custom_blue transition-colors duration-300">
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </button>
        {!isCollapsed && (
          <div className="bg-white p-2 rounded-lg shadow-md">
            <img 
              src="/niams_logo.jpg" 
              alt="Logo" 
              className="h-8 w-auto mx-auto"
            />
          </div>
        )}
      </div>
  
      <nav className="mt-6">
        <div className="flex flex-col">
          <Link to="/" className="text-black font-semibold hover:bg-pinkish_dark hover:text-white flex items-center py-3 px-4 rounded-md transition-colors duration-300">
            <FaInfoCircle className="mr-2" />
            {!isCollapsed && <span>Overview</span>}
          </Link>
          <div onClick={handleChatClick} className="text-black font-semibold hover:bg-pinkish_dark hover:text-white flex items-center py-3 px-4 cursor-pointer rounded-md transition-colors duration-300">
            <FaComments className="mr-2" />
            {!isCollapsed && <span>Chat</span>}
          </div>
        </div>
      </nav>
  
      {!isCollapsed && (
        <>
          <hr className="my-2 border-pinkish_dark" />
          <div className="p-4">
          <button onClick={startNewChat} className="w-full bg-white text-black font-bold p-3 rounded-lg hover:bg-pinkish_dark hover:text-white transition-colors duration-300 shadow-md">
            Start New Chat
          </button>

            <div className="mt-4 text-gray-100">
              <span className="block text-black font-semibold text-sm">Logged in as: {userName}</span>
              <span className="block text-black font-semibold text-sm mt-2">Total Tokens for this session: {totalTokens}</span>
              <span className="block text-black font-semibold text-sm">Total Cost for this session: ${totalCost.toFixed(2)}</span>
            </div>
          </div>
          <div className="p-4">
  {chats.map((chat) => (
    <div key={chat.id} className="relative flex justify-between items-center group hover:bg-pinkish_dark hover:text-white rounded-md transition-colors duration-300">
      
      <Link 
        to={`/chat/${chat.id}`} 
        className="absolute inset-0 z-10"
        aria-label={`Chat ${chat.name}`}
      ></Link>
      
      {/* The chat name is now clickable */}
      <div className="relative z-20 font-semibold block py-2 px-4 pointer-events-none">
        <Link to={`/chat/${chat.id}`} className="pointer-events-auto">
          {chat.name}
        </Link>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent the link click when clicking delete
          handleDeleteChat(chat.id);
        }}
        className="relative z-20 text-gray-300 hover:text-red-700 p-1 hidden group-hover:block transition-colors duration-300"
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
