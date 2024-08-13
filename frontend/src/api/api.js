import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000'; // Update this with your backend URL

export const sendMessage = async (message, history) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat/send`, {
      message,
      history
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

export const storeFeedback = async (message, feedback) => {
  try {
    await axios.post(`${API_BASE_URL}/feedback`, {
      message,
      feedback
    });
  } catch (error) {
    console.error("Error storing feedback:", error);
    throw error;
  }
};

export const searchBing = async (query) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bing/search`, {
      query
    });
    return response.data.results;
  } catch (error) {
    console.error("Error with Bing Search:", error);
    throw error;
  }
};