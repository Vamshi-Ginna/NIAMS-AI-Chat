import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {FaAngleLeft , FaBars, FaInfoCircle, FaComments, FaTimes, FaTrash, FaPlus, FaCommentDots } from 'react-icons/fa';
import { IoDocumentTextSharp  } from "react-icons/io5";
import { v4 as uuidv4 } from 'uuid';

interface SidebarProps {
  chats: { id: string; name: string; messages: { type: string; content: string }[]; tokens: number; cost: number; showPrompts: boolean }[];
  setChats: React.Dispatch<React.SetStateAction<{ id: string; name: string; messages: { type: string; content: string }[]; tokens: number; cost: number; showPrompts: boolean }[]>>;
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ chats, setChats, userName }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newChatName, setNewChatName] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const navigate = useNavigate();

  const totalTokens = chats.reduce((acc, chat) => acc + chat.tokens, 0);
  const totalCost = chats.reduce((acc, chat) => acc + chat.cost, 0);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleNewChat = () => {
    const newChat = {
      id: uuidv4(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
      tokens: 0,
      cost: 0,
      showPrompts: true,
    };
    setChats([...chats, newChat]);
    navigate(`/chat/${newChat.id}`);
  };

  const handleChatClick = () => {
    if (!chats.length) {
      handleNewChat();
    } else {
      navigate(`/chat/${chats[chats.length - 1].id}`);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      setChats(chats.filter((chat) => chat.id !== chatId));
      navigate('/');
    }
  };

  const handleSaveChatName = (chatId: string) => {
    if (!newChatName.trim()) {
      setEditingChatId(null);
      return;
    }
    setChats(chats.map((chat) => (chat.id === chatId ? { ...chat, name: newChatName } : chat)));
    setEditingChatId(null);
  };

  const handleBlur = (chatId: string, currentChatName: string) => {
    if (!newChatName.trim()) {
      setNewChatName(currentChatName);
    } else {
      handleSaveChatName(chatId);
    }
    setEditingChatId(null);
  };

  return (
    <div className={`bg-purple-800 shadow-xl ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col h-screen max-h-screen relative transition-all duration-300 ease-in-out`}>
      {/* Top Section: Collapse Button & Logo */}
      <div className="p-4 flex items-center"> 
        <button onClick={toggleSidebar} className="text-white hover:text-purple-300 transition-colors duration-300">
          {isCollapsed ? <FaBars /> : <FaAngleLeft  />}
        </button>
        {!isCollapsed && (
          <div className="flex items-center ml-1"> {/* Adjusted margin-left to 'ml-1' for a smaller gap */}
            <img src="/niams_white_logo.png" alt="Logo" className="h-11 w-auto" /> {/* Kept the reduced size */}
          </div>
        )}
      </div>
      {/* Navigation */}
      <nav className="my-6 ">
        <div className="flex flex-col">
          <Link to="/" className="text-white font-semibold hover:bg-purple-700 flex items-center py-3 px-4 rounded-md transition-colors duration-300">
            <FaInfoCircle className="mr-2" />
            {!isCollapsed && <span>Overview</span>}
          </Link>
          <Link to="/training" className="text-white font-semibold hover:bg-purple-700 flex items-center py-3 px-4 rounded-md transition-colors duration-300">
            <IoDocumentTextSharp  className="mr-2" />
            {!isCollapsed && <span>Training</span>}
          </Link>

          <div onClick={handleChatClick} className="text-white font-semibold hover:bg-purple-700 flex items-center py-3 px-4 cursor-pointer rounded-md transition-colors duration-300">
            <FaComments className="mr-2" />
            {!isCollapsed && <span>Chat</span>}
          </div>

          <div onClick={handleNewChat} className="text-white font-semibold hover:bg-purple-700 flex items-center py-3 px-4 cursor-pointer rounded-md transition-colors duration-300">
            <FaPlus className="mr-2" />
            {!isCollapsed && <span>Start New Chat</span>}
          </div>
        </div>
      </nav>

      <hr/>

      {/* User Info */}
      {!isCollapsed && (
        <div className="mt-4 text-white pl-4">
          <span className="block font-semibold text-sm">Logged in as: {userName}</span>
          <span className="block font-semibold text-sm mt-2">Total Tokens: {totalTokens}</span>
          <span className="block font-semibold text-sm">Total Cost: ${totalCost.toFixed(2)}</span>
        </div>
      )}

      {/* Chat List */}
      {!isCollapsed && (
        <div className="p-4 overflow-auto flex-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="relative flex justify-between items-center group hover:bg-purple-700 text-white rounded-md transition-colors duration-300"
              onMouseEnter={() => setShowTooltip(chat.id)}
              onMouseLeave={() => setShowTooltip(null)}
            >
              {editingChatId === chat.id ? (
                <input
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  onBlur={() => handleBlur(chat.id, chat.name)}
                  className="bg-white text-black p-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-700"
                  autoFocus
                />
              ) : (
                <div
                  className="relative z-20 font-semibold block py-2 px-4 pointer-events-none flex items-center"
                  onDoubleClick={() => {
                    setEditingChatId(chat.id);
                    setNewChatName(chat.name);
                  }}
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    maxWidth: '22ch',
                  }}
                >
                  <FaCommentDots className="mr-2 text-white-400" />
                  <Link to={`/chat/${chat.id}`} className="pointer-events-auto">
                    {chat.name}
                  </Link>
                </div>
              )}

              {showTooltip === chat.id && (
                <div className="absolute top-full mt-1 bg-gray-700 text-white text-xs rounded-lg py-1 px-2 shadow-lg">
                  Double-click to rename
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat.id);
                }}
                className="relative z-20 text-white-300 hover:text-red-500 p-1 transition-colors duration-300"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
