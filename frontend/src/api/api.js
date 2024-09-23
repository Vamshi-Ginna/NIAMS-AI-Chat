import axios from "axios";
import { msalInstance } from "../index";
import { loginRequest, tokenRequest } from "../authConfig";

//const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_API_URL || ""
    : window.env.REACT_APP_API_URL || "";

// Function to get access token
const getAccessToken = async () => {
  let account = msalInstance.getActiveAccount();
  if (!account) {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
      account = accounts[0];
    } else {
      await msalInstance.loginRedirect(loginRequest);
      return null;
    }
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...tokenRequest,
      account: account,
    });
    return response.accessToken;
  } catch (error) {
    if (error instanceof msalInstance.InteractionRequiredAuthError) {
      await msalInstance.acquireTokenRedirect(tokenRequest);
      return null;
    }
    throw error;
  }
};

// Axios instance with an interceptor to add the token
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to login the user in the backend after Azure AD login
export const loginUser = async () => {
  try {
    const response = await api.post("/auth/login");
    return response.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const sendFeedback = async (messageId, rating, feedback) => {
  try {
    const response = await api.post("/feedback/", {
      message_id: messageId,
      rating: rating,
      comment: feedback,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending feedback:", error);
    throw error;
  }
};

//currently not in use. shift the code flow to streamMessage
export const sendMessage = async (message, history, chatId) => {
  try {
    const response = await api.post(
      "/chat/send",
      {
        message,
        history: history.slice(-15), // only sending the last 15 conversations
      },
      {
        headers: {
          "Chat-Id": chatId, // Attach chatId in headers
        },
      }
    );
    return response.data; // This will include message_id in the response
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Function to handle streaming the chat response using Server-Sent Events (SSE)
export const streamMessage = async (
  message,
  history,
  chatId,
  onMessage,
  onError,
  onDone
) => {
  try {
    const token = await getAccessToken(); // Fetch token before making the request

    const response = await fetch(`${API_BASE_URL}/chat/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add the Authorization header with the token
        "Chat-Id": chatId, // Attach chatId in headers
      },
      body: JSON.stringify({
        message,
        history: history.slice(-15), // Send the last 15 messages
      }),
    });

    // Check if the response is a stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    let accumulatedMessage = "";

    const processStream = async ({ done, value }) => {
      if (done) {
        onDone({ response: accumulatedMessage });
        return;
      }

      // Decode the stream chunks
      const chunk = decoder.decode(value, { stream: true });

      // Process each line of the chunk
      chunk.split("\n").forEach((line) => {
        //console.log("Inside outer for loop");
        //console.log(line);

        if (line.startsWith("data:")) {
          // Remove "data: " prefix and trim the line
          //console.log("Line before cleaning");
          //console.log(line);
          line = line.replace("data: ", "").trim();
          const cleanLine = line.replace("data: ", "").trim();

          //console.log(cleanLine);
          // console.log("Inside for each");
          //console.log(cleanLine);

          // Handle [DONE] case
          if (cleanLine === "[DONE]") {
            return; // No need to close the eventSource as we're not using EventSource
          }

          // Skip if the cleanLine is empty
          if (!cleanLine) {
            return;
          }

          try {
            // Now safely parse the clean JSON data
            //console.log("clean line before parsing");
            //console.log(cleanLine);
            const parsedData = JSON.parse(cleanLine);
            // Process the parsed data
            if (parsedData.data && !parsedData.data?.response) {
              //console.log(parsedData.data);
              onMessage(parsedData.data); // Call onMessage callback
            }

            if (parsedData.data?.response) {
              console.log("Parsed data:", parsedData);
              onDone(parsedData.data); // Call onDone callback when final response is received
            }
          } catch (error) {
            console.error("Error parsing JSON in stream:", error, cleanLine);
            onError(error); // Call error callback
          }
        }
      });

      // Recursively read the next chunk
      reader.read().then(processStream);
    };

    // Start reading the stream
    reader.read().then(processStream);
  } catch (error) {
    console.error("Error in fetch connection:", error);
    onError(error); // Call the error callback
  }
};

export const summarizeFile = async (file, chatId) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const token = await getAccessToken(); // Manually add the token to this request
    const response = await api.post("/chat/upload_document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Chat-Id": chatId, // Attach chatId in headers
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return response.data.summary;
  } catch (error) {
    console.error("Error summarizing file:", error);
    throw error;
  }
};

export const cleanup_chat_sessions = async (chatIds) => {
  try {
    const response = await api.post("/chat/cleanup_chat_sessions", {
      chat_ids: [...chatIds],
    });
    return response.data; // This will include message_id in the response
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const storeFeedback = async (message, feedback) => {
  try {
    const response = await api.post("/feedback", {
      message,
      feedback,
    });
    return response.data;
  } catch (error) {
    console.error("Error storing feedback:", error);
    throw error;
  }
};

export const searchBing = async (query) => {
  try {
    const response = await api.post("/bing/search", {
      query,
    });
    return response.data.results;
  } catch (error) {
    console.error("Error with Bing Search:", error);
    throw error;
  }
};
