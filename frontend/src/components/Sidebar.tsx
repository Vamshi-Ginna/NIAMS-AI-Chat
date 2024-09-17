import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaDollarSign,
  FaCoins,
  FaUserCircle,
  FaAngleLeft,
  FaBars,
  FaInfoCircle,
  FaComments,
  FaTimes,
  FaTrash,
  FaPlus,
  FaCommentDots,
} from "react-icons/fa";
import { IoDocumentTextSharp } from "react-icons/io5";
import { v4 as uuidv4 } from "uuid";
import { TbMessageFilled } from "react-icons/tb";
import { cleanup_chat_sessions } from "../api/api";

interface SidebarProps {
  chats: {
    id: string;
    name: string;
    messages: { type: string; content: string }[];
    tokens: number;
    cost: number;
    showPrompts: boolean;
  }[];
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        name: string;
        messages: { type: string; content: string }[];
        tokens: number;
        cost: number;
        showPrompts: boolean;
      }[]
    >
  >;
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ chats, setChats, userName }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newChatName, setNewChatName] = useState<string>("");
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const navigate = useNavigate();

  const totalTokens = chats.reduce((acc, chat) => acc + chat.tokens, 0);
  const totalCost = chats.reduce((acc, chat) => acc + chat.cost, 0);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Add effect for cleaning up chats on window close/refresh
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Show confirmation dialog to the user
      event.preventDefault();
     // event.returnValue = ""; // This triggers the confirmation dialog in modern browsers

      // Event listener for confirming the cleanup once the user accepts the reload/close
      const cleanupOnUnload = async () => {
        const chatIds = chats.map((chat) => chat.id);

        if (chatIds.length > 0) {
          try {
            // Call the cleanup API to delete chat sessions on the backend
            await cleanup_chat_sessions(chatIds);
            console.log("All chats cleaned up successfully.");
          } catch (error) {
            console.error("Error cleaning up chats on page unload:", error);
          }
        }
      };

      // Attach the cleanup logic only if the user confirms they want to close/reload the page
      window.addEventListener("unload", cleanupOnUnload);

      // Clean up the event listener when the component unmounts
      return () => {
        window.removeEventListener("unload", cleanupOnUnload);
      };
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [chats]);

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

  const handleDeleteChat = async (chatId: string) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        // Call the backend API to clean up the chat session
        await cleanup_chat_sessions([chatId]);

        // Remove the chat from the UI
        setChats(chats.filter((chat) => chat.id !== chatId));

        // Navigate back to the main page after deletion
        navigate("/");
      } catch (error) {
        console.error("Error cleaning up chat session:", error);
      }
    }
  };

  const handleSaveChatName = (chatId: string) => {
    if (newChatName.trim()) {
      setChats(
        chats.map((chat) =>
          chat.id === chatId ? { ...chat, name: `${newChatName}` } : chat
        )
      );
      setNewChatName("");
      setEditingChatId(null);
    }
  };

  const handleBlur = (chatId: string, currentChatName: string) => {
    if (newChatName.trim()) {
      handleSaveChatName(chatId);
    } else {
      setNewChatName(currentChatName);
    }
    setEditingChatId(null);
  };

  return (
    <div
      className={`bg-pinkish shadow-xl ${isCollapsed ? "w-16" : "w-64"} flex flex-col h-screen max-h-screen relative transition-all duration-300 ease-in-out`}
    >
      {/* Top Section: Collapse Button & Logo */}
      <div className="p-4 flex items-center">
        {!isCollapsed && (
          <div className="bg-white p-2 rounded-lg shadow-md">
            <img
              src="/niams_logo.jpg"
              alt="Logo"
              className="h-12 w-auto mx-auto"
            />
          </div>
        )}
      </div>
      {/* <hr className="border-t-1 border-pinkish_dark" /> */}
      <div className="p-4 flex items-center">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="text-black hover:text-white transition-colors duration-300"
        >
          {isCollapsed ? <FaBars /> : <FaAngleLeft />}
        </button>
        {/* User Info */}
        {!isCollapsed && (
          <div className="pl-4 flex items-center text-black">
            <div className="flex items-center">
              {/* User Icon */}
              <div className="mr-3">
                <FaUserCircle className="text-4xl text-black" />
              </div>
              <div>
                {/* User Name */}
                <span className="block font-semibold text-sm">
                  Logged in as:
                </span>
                <span className="block font-semibold text-base">
                  {userName}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* <hr className="border-t-1 border-pinkish_dark" /> */}
      {/* Navigation */}
      <nav className="my-6 ">
        <div className="flex flex-col">
          <Link
            to="/"
            className="text-black font-semibold hover:bg-pinkish_dark hover:text-white flex items-center py-3 px-4 rounded-md transition-colors duration-300"
          >
            <FaInfoCircle className="mr-2" aria-label="Overview" />
            {!isCollapsed && <span>Overview</span>}
          </Link>
          <Link
            to="/training"
            className="text-black font-semibold hover:bg-pinkish_dark hover:text-white flex items-center py-3 px-4 rounded-md transition-colors duration-300"
          >
            <IoDocumentTextSharp className="mr-2" aria-label="Training" />
            {!isCollapsed && <span>Training</span>}
          </Link>

          {/* <div onClick={handleChatClick} className="text-white font-semibold hover:bg-purple-700 flex items-center py-3 px-4 cursor-pointer rounded-md transition-colors duration-300">
            <FaComments className="mr-2" aria-label="Chat" />
            {!isCollapsed && <span>Chat</span>}
          </div> */}

          <div
            onClick={handleNewChat}
            className="text-black font-semibold hover:bg-pinkish_dark hover:text-white flex items-center py-3 px-4 cursor-pointer rounded-md transition-colors duration-300"
          >
            <FaPlus className="mr-2" aria-label="Start New Chat" />
            {!isCollapsed && <span>Start New Chat</span>}
          </div>
        </div>
      </nav>

      {/* <hr className="border-t-1 border-pinkish_dark" /> */}

      {/* Token Info */}
      {!isCollapsed && (
        <div className="text-black pl-4">
          <div className="flex items-center py-2">
            <FaCoins className="mr-2 text-xl" /> {/* Total Tokens Icon */}
            <span className="font-semibold text-sm">
              Total Tokens: {totalTokens}
            </span>
          </div>
          <div className="flex items-center py-2">
            <FaDollarSign className="mr-2 text-xl" /> {/* Total Cost Icon */}
            <span className="font-semibold text-sm">
              Total Cost: ${totalCost.toFixed(2)}
            </span>
          </div>
        </div>
      )}
      {/* <hr className="border-t-1 border-pinkish_dark" /> */}
      {/* Chat List */}
      {!isCollapsed && (
        <div className="p-4 overflow-auto flex-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="relative flex justify-between items-center group hover:bg-pinkish_dark hover:text-white text-black rounded-md transition-colors duration-300"
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
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    maxWidth: "22ch",
                  }}
                >
                  <TbMessageFilled className="mr-2 text-black-400" />
                  <Link
                    to={`/chat/${chat.id}`}
                    className="pointer-events-auto"
                    title={chat.name}
                  >
                    {chat.name.length > 14
                      ? `${chat.name.substring(0, 14)}...`
                      : chat.name}
                  </Link>
                </div>
              )}

              {showTooltip === chat.id && (
                <div className="absolute top-full mt-1 bg-gray-700 text-white text-xs rounded-lg py-1 px-2 shadow-lg z-50">
                  Double-click to rename
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat.id);
                }}
                className="relative z-20 text-black hover:text-red-500 p-1 transition-colors duration-300"
                aria-label="Delete Chat"
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
