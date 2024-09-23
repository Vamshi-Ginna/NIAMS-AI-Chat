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
import html2canvas from "html2canvas";

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
  //const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true); // Track whether auto-scroll is enabled
  const eventSourceRef = useRef<EventSource | null>(null); // Ref for SSE
  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // Function to detect user scroll and toggle auto-scroll
  // const handleScroll = () => {
  //   if (chatContainerRef.current) {
  //     const { scrollTop, scrollHeight, clientHeight } =
  //       chatContainerRef.current;
  //     const isAtBottom = scrollHeight - clientHeight <= scrollTop + 10; // Tolerance for floating point precision

  //     if (isAtBottom) {
  //       setIsAutoScrollEnabled(true); // Enable auto-scroll when the user scrolls to the bottom
  //     } else {
  //       setIsAutoScrollEnabled(false); // Disable auto-scroll when the user scrolls up
  //     }
  //   }
  // };
  useEffect(() => {
    scrollToBottom(); // Scroll to the bottom every time messages update
  }, [chat?.messages]);

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
    tokens: number;
    cost: number;
  }

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

        scrollToBottom(); // Ensure chat scrolls down
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
      },
      (finalData: FinalResponseData) => {
        // Final response with tokens and cost
        console.log("Final Data invoked");
        console.log(finalData);

        // Logging the specific token and cost values
        console.log("Tokens received:", finalData.tokens);
        console.log("Cost received:", finalData.cost);
        // Logging the specific token and cost values
        console.log("Chat Tokens:", chat.tokens);
        console.log("chat Cost:", chat.cost);

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === id
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg.content === assistantMessage
                      ? { ...msg, message_id: finalData.message_id }
                      : msg
                  ),
                  // Ensure tokens and cost are always numbers and have valid fallback values
                  tokens: (chat.tokens || 0) + (finalData.tokens || 0),
                  cost: (chat.cost || 0) + (finalData.cost || 0),
                }
              : chat
          )
        );
      }
    );
  };

  // Function to handle file uploads
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

  // Handle thumbs down feedback
  const handleThumbsDown = (message: string) => {
    console.log("Thumbs down clicked for message:", message);
    // Implement feedback submission logic here
  };

  // Function to download the chat as PDF
  // const handleDownloadChat = async () => {
  //   if (!chat) return;

  //   console.log(JSON.stringify(chat))
  //   const input = document.getElementById('chat-content') as HTMLElement;
  //   const canvas = await html2canvas(input);
  //   const imgData = canvas.toDataURL('image/png');
  //   const pdf = new jsPDF();

  //   pdf.text(`Chat: ${chat.name}`, 10, 10);
  //   pdf.text(`Tokens: ${chat.tokens}`, 10, 20);
  //   pdf.text(`Cost: $${chat.cost.toFixed(2)}`, 10, 30);

  //   pdf.addImage(imgData, 'PNG', 0, 40, 210, 297); // Adjust dimensions
  //   pdf.save(`${chat.name}.pdf`);
  // };

  // Function to download the chat as PDF

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
      </div>

      {/* Chat Input */}
      {chat && (
        <ChatInput
          onSendMessage={handleSendMessage}
          onFileChange={handleFileChange}
          onDownloadChat={handleDownloadChat}
        />
      )}

      {/* React Toastify Container */}
      <ToastContainer />
    </div>
  );
};

export default Chat;
