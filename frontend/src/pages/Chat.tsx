import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import { sendMessage, summarizeFile, streamMessage } from "../api/api";
import PromptsAndInteractions from "../components/PromptsAndInteractions";
import { v4 as uuidv4 } from "uuid";
import jsPDF from "jspdf";

import { useInView } from "react-intersection-observer";

interface Message {
  type: string;
  content: string;
  message_id?: string;
  isNew?: boolean;
}

interface ChatProps {
  chats: {
    id: string;
    name: string;
    messages: Message[];
    tokens: number;
    cost: number;
    showPrompts: boolean;
  }[];
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        name: string;
        messages: Message[];
        tokens: number;
        cost: number;
        showPrompts: boolean;
      }[]
    >
  >;
  userName: string;
}

const Chat: React.FC<ChatProps> = ({ chats, setChats, userName }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chat = chats.find((chat) => chat.id === id);

  // Create a ref for the chat container
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [isAssistantMessageInProgress, setIsAssistantMessageInProgress] =
    useState(false); // Track message progress

  //const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true); // Track whether auto-scroll is enabled
  //const eventSourceRef = useRef<EventSource | null>(null); // Ref for SSE
  //const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Track timeout for debounced scroll handling

  // Add the Intersection Observer hook for detecting when user is at the bottom
  const { ref: bottomRef, inView: isBottomInView } = useInView({
    threshold: 0.1, // Adjust the threshold if necessary
  });

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (chatContainerRef.current && isAutoScrollEnabled) {
      console.log("Scrolling to bottom...");
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    } else {
      console.log("Auto-scroll is disabled, not scrolling.");
    }
  };

  // Log scrolling state and isBottomInView whenever it changes
  useEffect(() => {
    console.log("isBottomInView: ", isBottomInView);
    console.log("isAutoScrollEnabled: ", isAutoScrollEnabled);
  }, [isBottomInView, isAutoScrollEnabled]);

  useEffect(() => {
    // Only scroll to bottom if auto-scroll is enabled
    if (isAutoScrollEnabled) {
      scrollToBottom();
    } else {
      console.log(
        "Auto-scroll is disabled, not scrolling to bottom on new message."
      );
    }
  }, [chats, isAutoScrollEnabled]);

  // Handle when user manually scrolls
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isUserAtBottom = scrollHeight - clientHeight <= scrollTop + 50;

      if (!isUserAtBottom) {
        // Disable auto-scroll if user scrolled up
        setIsAutoScrollEnabled(false);
        console.log("User scrolled up, disabling auto-scroll.");
      } else {
        // Only re-enable auto-scroll when the user reaches the bottom
        setIsAutoScrollEnabled(true);
        console.log("User reached the bottom, enabling auto-scroll.");
      }
    }
  };

  // React to the user reaching the bottom of the chat
  useEffect(() => {
    if (isBottomInView) {
      // Re-enable auto-scroll when user is back at the bottom
      setIsAutoScrollEnabled(true);
      console.log("User is at the bottom, enabling auto-scroll.");
    }
  }, [isBottomInView]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
      return () => {
        chatContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  // Initialize a new chat if no chat is found or the current chat is invalid
  useEffect(() => {
    if (!id && chats.length === 0) {
      const newChat = {
        id: uuidv4(),
        name: `Chat ${chats.length + 1}`,
        messages: [],
        tokens: 0,
        cost: 0,
        showPrompts: true, // Show prompts initially for new chat
      };
      setChats([...chats, newChat]);
      navigate(`/chat/${newChat.id}`);
    }
  }, [id, chats, setChats, navigate]);

  // Handle chat not found scenario
  useEffect(() => {
    if (!chat) {
      // Show an error toast notification
      toast.error("Chat not found. Redirecting to overview page...", {
        position: "top-right", // Corrected position usage
        autoClose: 3000, // Closes after 3 seconds
      });

      // Redirect to overview after a short delay
      setTimeout(() => {
        navigate("/"); // Adjust the path based on your actual overview page
      }, 3000);
    }
  }, [chat, navigate]);

  // Define the type for finalData
  interface FinalResponseData {
    message_id: string;
    response: string;
    tokens: number;
    cost: number;
  }
  const typeWriterEffect = (
    message: string,
    callback: (char: string) => void,
    delay = 50
  ) => {
    let index = 0;

    // Create a function that will progressively display the message one character at a time
    const typingInterval = setInterval(() => {
      if (index < message.length) {
        callback(message[index]);
        index++;
      } else {
        clearInterval(typingInterval); // Clear the interval when done
      }
    }, delay);
  };

  // Function to handle sending messages
  const handleSendMessage = async (message: string) => {
    if (!chat) return; // Prevent accessing undefined

    const updatedChats = chats.map((chat) => {
      if (chat.id === id) {
        // Check if it's the very first user message by inspecting if there are any messages
        const isFirstMessage = chat.messages.length === 0;

        return {
          ...chat,
          name: isFirstMessage ? message.slice(0, 30) : chat.name, // Update the chat name if it's the first message
          messages: [
            ...chat.messages,
            { type: "user", content: message, isNew: true },
            // Add an empty assistant message to update progressively
            { type: "assistant", content: "...", isNew: true },
          ],
          showPrompts: false, // Hide prompts when a message is sent
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setIsAssistantMessageInProgress(true); // Start streaming, set flag to true

    let assistantMessage = "";

    // Stream the response from the backend
    // Stream the response from the backend
    streamMessage(
      message,
      chat?.messages || [],
      chat.id,
      (chunk: string) => {
        // Accumulate the response chunks
        assistantMessage += String(chunk);
        //console.log(assistantMessage);

        // Update the chat messages in the current state
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === id
              ? {
                  ...chat,
                  messages: chat.messages.map((msg, index) =>
                    // Find the last assistant message and update it with streamed chunks
                    msg.type === "assistant" &&
                    index === chat.messages.length - 1
                      ? { ...msg, content: assistantMessage }
                      : msg
                  ),
                }
              : chat
          )
        );

        if (isBottomInView) {
          console.log("Inside set function");
          scrollToBottom(); // Only scroll to bottom if auto-scroll is enabled
        }
      },
      (_error: any) => {
        // Handle error
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === id
              ? {
                  ...chat,
                  messages: chat.messages.map((msg, index) =>
                    // Update the last assistant message with an error message
                    msg.type === "assistant" &&
                    index === chat.messages.length - 1
                      ? { ...msg, content: "Error occurred" }
                      : msg
                  ),
                }
              : chat
          )
        );
        setIsAssistantMessageInProgress(false); // Error occurred, reset flag
      },
      (finalData: FinalResponseData) => {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === id
              ? {
                  ...chat,
                  // Update the last assistant message (which contains the placeholder "...")
                  messages: chat.messages.map((msg, index) =>
                    msg.type === "assistant" && msg.content === "..."
                      ? {
                          ...msg,
                          content: finalData.response, // Replace placeholder with actual Bing search response or LLM final message
                          message_id: finalData.message_id, // Assign message ID
                        }
                      : msg
                  ),
                  // Ensure tokens and cost are always numbers and have valid fallback values
                  tokens: (chat.tokens || 0) + (finalData.tokens || 0),
                  cost: (chat.cost || 0) + (finalData.cost || 0),
                }
              : chat
          )
        );
        setIsAssistantMessageInProgress(false); // Finished streaming, reset flag
      }
    );
  };

  // Function to handle file uploads
  const handleFileChange = async (file: File) => {
    if (!chat) return; // Prevent accessing undefined

    const allowedExtensions = ["pdf", "json", "docx", "txt", "md", "xml"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    if (file && chat) {
      const userMessage = `File: ${file.name}`;

      // Update chat with user's file message
      const updatedChats = chats.map((c) => {
        if (c.id === chat.id) {
          return {
            ...c,
            messages: [
              ...c.messages,
              { type: "user", content: userMessage, isNew: true },
              {
                type: "assistant",
                content: "...", // Placeholder while waiting for the backend
                isNew: true,
              },
            ],
          };
        }
        return c;
      });
      setChats(updatedChats);

      // Handle file processing
      if (allowedExtensions.includes(fileExtension)) {
        try {
          const summary = await summarizeFile(file, chat.id); // Send file to backend for summarization

          // Update chat with the summary from the backend
          const updatedChatsWithResponse = updatedChats.map((c) => {
            if (c.id === chat.id) {
              return {
                ...c,
                messages: c.messages.map((msg, index) =>
                  msg.content === "..."
                    ? { type: "assistant", content: summary, isNew: true }
                    : { ...msg, isNew: false }
                ),
              };
            }
            return c;
          });
          setChats(updatedChatsWithResponse);
        } catch (error) {
          // Error handling for file processing
          const updatedChatsWithError = updatedChats.map((c) => {
            if (c.id === chat.id) {
              return {
                ...c,
                messages: c.messages.map((msg, index) =>
                  msg.content === "..."
                    ? {
                        type: "assistant",
                        content: "Error: Unable to fetch summary",
                        isNew: false,
                      }
                    : msg
                ),
              };
            }
            return c;
          });
          setChats(updatedChatsWithError);
        }
      } else {
        // Handle unsupported file types
        const errorMessage = `Invalid file type: ${file.name}. Please upload a valid file of type: .pdf, .json, .docx, .txt, .md, or .xml.`;

        const updatedChatsWithError = updatedChats.map((c) => {
          if (c.id === chat.id) {
            return {
              ...c,
              messages: c.messages.map((msg, index) =>
                msg.content === "..."
                  ? { type: "assistant", content: errorMessage, isNew: true }
                  : { ...msg, isNew: false }
              ),
            };
          }
          return c;
        });
        setChats(updatedChatsWithError);
      }
    }
  };

  const handleDownloadChat = () => {
    if (!chat) return;

    const doc = new jsPDF();
    const lineHeight = 10; // Height for each line

    // Add Title
    doc.setFontSize(22);
    doc.text("NIAMS AI CHAT", 105, 20, { align: "center" }); // Center the title

    // Add Chat Metadata
    doc.setFontSize(12);
    doc.text(`Chat: ${chat.name}`, 10, 40);
    doc.text(`Tokens: ${chat.tokens}`, 10, 50);
    doc.text(`Cost: $${chat.cost.toFixed(2)}`, 10, 60);

    // Divider
    doc.setLineWidth(0.5);
    doc.line(10, 65, 200, 65); // Horizontal line

    // Start position for chat messages
    let yOffset = 75;

    chat.messages.forEach((message) => {
      const typeLabel = message.type === "user" ? "User" : "Assistant";

      // Make the label bold
      doc.setFont("Helvetica", "bold");

      // Set label text
      const labelText = `${typeLabel}:  `;

      // Add label text (bold)
      doc.text(labelText, 10, yOffset);

      // Reset font back to normal for the message content
      doc.setFont("Helvetica", "normal");

      // Split message text into lines that fit the page width (180 units wide)
      const messageContent = message.content;
      const splitText = doc.splitTextToSize(messageContent, 180);

      // Adjust yOffset for the message content (since the label already used some space)
      splitText.forEach((line: string, index: number) => {
        // If this is the first line, print it next to the label
        if (index === 0) {
          const labelWidth = doc.getTextWidth(labelText); // Get width of the label
          doc.text(line, 10 + labelWidth, yOffset); // Print the first line next to the label
        } else {
          if (yOffset + lineHeight > 280) {
            doc.addPage(); // Add a new page
            yOffset = 20; // Reset yOffset for new page
          }
          doc.text(line, 10, yOffset); // Print remaining lines normally
        }

        yOffset += lineHeight;
      });
    });

    // Save the PDF with the chat name
    doc.save(`${chat.name}.pdf`);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="token-info absolute top-0 left-0 m-2 p-2 bg-gray-100 bg-opacity-80 rounded shadow">
        {chat && (
          <>
            <span className="font-bold" title={chat.name}>
              {chat.name.length > 20
                ? `${chat.name.substring(0, 20)}...`
                : chat.name}{" "}
              -
            </span>
            <span>Tokens: {chat.tokens}</span>
            <span> Cost: ${chat.cost.toFixed(2)}</span>
          </>
        )}
      </div>
      <br></br>
      <br></br>
      {/* Center the PromptsAndInteractions */}
      {chat?.showPrompts && (
        <div className="flex flex-1 items-center justify-center">
          <PromptsAndInteractions
            userName={userName}
            onCardClick={(message: string) => handleSendMessage(message)}
          />
        </div>
      )}

      {/* Chat Messages Section */}
      {/* Chat Messages Section */}
      <div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
        {chat?.messages.map((msg, index) => (
          <ChatMessage
            key={index}
            message={msg}
            type={msg.type}
            scrollToBottom={scrollToBottom}
            onThumbsDown={() => {}}
          />
        ))}
        {/* Ref element for detecting when at the bottom */}
        <div ref={bottomRef} style={{ height: "1px" }} />
      </div>

      {/* Chat Input */}
      {chat && (
        <ChatInput
          onSendMessage={handleSendMessage}
          onFileChange={handleFileChange}
          onDownloadChat={handleDownloadChat}
          isAssistantMessageInProgress={isAssistantMessageInProgress} // Pass the flag here
        />
      )}

      {/* React Toastify Container */}
      <ToastContainer />
    </div>
  );
};

export default Chat;
