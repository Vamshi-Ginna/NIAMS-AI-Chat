import axios from 'axios';
import { msalInstance } from '../index';
import { loginRequest, tokenRequest } from '../authConfig';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
      account: account
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

// Create an axios instance with an interceptor to add the token
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const sendMessage = async (message, history) => {
  try {
    const response = await api.post('/chat/send', {
      message,
      history,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const summarizeFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/chat/upload_document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.summary;
  } catch (error) {
    console.error("Error summarizing file:", error);
    throw error;
  }
};