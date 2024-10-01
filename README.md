# NIAMS AI Chat Application

## Overview

The **NIAMS AI Chat** application is a powerful, enterprise-level chatbot platform designed to assist users with a variety of tasks. Built on top of the **Azure OpenAI GPT model**, the application supports multiple functionalities such as:

- Text Summarization
- Creative Content Generation
- Language Translation
- Technical Dialogues

The platform is developed using a **React** frontend and a **FastAPI** backend, integrating **LangChain** to facilitate interactions with the AI model. It also leverages **Power BI** for advanced analytics and visualization of chatbot usage, performance, and cost-efficiency.

The system tracks user interactions, feedback, and associated costs for in-depth analysis, ensuring that the chatbot remains efficient and cost-effective.

## Data Overview

The application captures and stores the following data in a structured format:

### Users Table
- `user_id`: Unique identifier for each user
- `name`: Name of the user
- `created_at`: Account creation timestamp
- `group_name`: Assigned user group (IRP, OD, SITB, EP, Other)

### Chat Messages Table
- `message_id`: Unique identifier for each chat message
- `user_id`: ID of the user associated with the message
- `user_prompt`: User's input or prompt
- `response`: AI-generated response
- `source`: Source of the response (OpenAI, Bing, Document)
- `created_at`: Timestamp of message creation
- `category`: Categorization of the message (e.g., text summarization, creative content generation, etc.)

### Feedback Table
- `feedback_id`: Unique identifier for each feedback entry
- `message_id`: Associated message ID
- `rating`: User's rating of the response (on a scale of 5)
- `comment`: Optional user feedback comment
- `user_id`: ID of the user who provided the feedback
- `created_at`: Timestamp of feedback submission

### Price Table
- `price_id`: Unique identifier for each cost entry
- `message_id`: Associated message ID
- `completion_price`: Price incurred for processing the message
- `created_at`: Timestamp of cost entry creation

## Features

- **Multi-User Login**: Multiple users can log in and utilize the application simultaneously.
- **Multi-Session Chat**: Each user can manage multiple chat sessions, ensuring flexibility in conversations.
- **Document Upload and Query**: Users can upload and query documents in various formats, including `.pdf`, `.json`, `.docx`, `.txt`, `.md`, and `.xml`, enabling the chatbot to interact with custom data.
- **Bing Search API Integration**: The chatbot is integrated with the Bing Search API, providing the latest and most current information in real-time.
- **Cost Tracking**: The system records completion costs for AI interactions, allowing for detailed analysis of expenses.
- **User Feedback**: Users can rate and comment on AI responses to help improve the system's performance.
- **Data Visualization**: Comprehensive insights into user interactions and chatbot performance are visualized using Power BI. (still under developement)


## Setup and Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd ./backend/
   
2. Create a virtual environment:
   ```bash
   python -m venv .venv
   
3. Activate the virtual environment:
    
   For Windows 
   ```bash
   .\.venv\Scripts\Activate
   ```
   
   For macOS/Linux: 
   
   ```bash
   source .venv/bin/activate
   
4. Install the required dependencies:
    ```bash
    pip install -r requirements.txt

5. Run the backend server:
    ```bash
    uvicorn main:app --reload

### Frontend Setup

1. Navigate to the frontend directory:
    
   ```bash
   cd ./frontend/
2. Install the necessary dependencies:
    
    ```bash
    npm install

3. Start the frontend application

    ```bash
    npm start
