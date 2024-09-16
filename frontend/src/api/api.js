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

export const sendMessage = async (message, history) => {
  try {
    const response = await api.post("/chat/send", {
      message,
      history: history.slice(-15), //only sending last 15 conversations
    });
    return response.data; // This will include message_id in the response
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const summarizeFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const token = await getAccessToken(); // Manually add the token to this request
    const response = await api.post("/chat/upload_document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return response.data.summary;
  } catch (error) {
    console.error("Error summarizing file:", error);
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
