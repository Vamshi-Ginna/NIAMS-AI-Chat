import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Chat from './pages/Chat';

const App: React.FC = () => {
  const [chats, setChats] = useState<{ id: string; name: string; messages: { type: string; content: string }[], tokens: number, cost: number }[]>([]);

  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar chats={chats} setChats={setChats} />
        <div className="flex-1 overflow-y-auto relative">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/chat/:id" element={<Chat chats={chats} setChats={setChats} />} />
            <Route path="/chat/*" element={<Chat chats={chats} setChats={setChats} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;