import React, { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview";
import Chat from "./pages/Chat";
import { MsalAuthenticationTemplate } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import { InteractionType } from "@azure/msal-browser";
import { loginUser } from "./api/api";
import Training from "./pages/Training";

const App: React.FC = () => {
  const { instance, accounts } = useMsal();

  // Update the chats state to include showPrompts field
  const [chats, setChats] = React.useState<
    {
      id: string;
      name: string;
      messages: { type: string; content: string }[];
      tokens: number;
      cost: number;
      showPrompts: boolean;
    }[]
  >([]);

  const userName =
    accounts.length > 0
      ? accounts[0].name
        ? accounts[0].name
            .split(",")
            .reverse()
            .map((name) => name.trim())
            .join(" ")
        : "Guest"
      : "Guest";

  useEffect(() => {
    // Call the login API after the user is authenticated to create a user record on backend if not already created
    if (accounts.length > 0) {
      // Call the loginUser function to trigger the API call
      loginUser()
        .then((response) => {
          console.log("User login successful:", response);
        })
        .catch((error) => {
          console.error("Error during login:", error);
        });
    }
  }, [accounts]); // Trigger whenever the `accounts` (multiple AD accounts) array changes

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      //event.returnValue = 'Your chat session data will be lost if you refresh or close the tab.';
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Redirect}
      authenticationRequest={loginRequest}
    >
      <Router>
        <div className="flex h-screen">
          <Sidebar chats={chats} setChats={setChats} userName={userName} />
          <div className="flex-1 overflow-y-auto relative">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/training" element={<Training />} />
              <Route
                path="/chat/:id"
                element={
                  <Chat chats={chats} setChats={setChats} userName={userName} />
                }
              />
              <Route
                path="/chat/*"
                element={
                  <Chat chats={chats} setChats={setChats} userName={userName} />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </MsalAuthenticationTemplate>
  );
};

export default App;
