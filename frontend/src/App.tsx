import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Chat from './pages/Chat';
import { MsalAuthenticationTemplate } from '@azure/msal-react';
import { loginRequest } from './authConfig';
import { InteractionType } from '@azure/msal-browser'; // Import InteractionType

const App: React.FC = () => {
  const [chats, setChats] = React.useState<{ id: string; name: string; messages: { type: string; content: string }[], tokens: number, cost: number }[]>([]);

  return (
    <MsalAuthenticationTemplate interactionType={InteractionType.Redirect} authenticationRequest={loginRequest}>
      <Router>
        <div className="flex h-screen">
          <Sidebar chats={chats} setChats={setChats} />
          <div className="flex-1 overflow-y-auto relative">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/chat/:id" element={<Chat chats={chats} setChats={setChats} />} />
              <Route path="/chat/*" element={<Chat chats={chats} setChats={setChats} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </MsalAuthenticationTemplate>
  );
};

export default App;
