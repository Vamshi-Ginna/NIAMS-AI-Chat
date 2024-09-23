import React, { useState, useEffect, useRef } from "react";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineFeedback, MdContentCopy, MdCheck } from "react-icons/md";
import { RiRobot2Line } from "react-icons/ri";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import FeedbackPopup from "./FeedbackPopup";

interface ChatMessageProps {
  message: any;
  type: string;
  onThumbsDown: (message: string) => void;
  scrollToBottom: () => void; // Accept scrollToBottom as a prop
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  type,
  scrollToBottom, // Scroll function passed as prop
  onThumbsDown,
}) => {
  const [displayedMessage, setDisplayedMessage] = useState<string>(
    message.content
  );
  const [copied, setCopied] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Immediate rendering of the message (no typing effect)
  useEffect(() => {
    const content = typeof message === "string" ? message : message.content;
    setDisplayedMessage(content);
    scrollToBottom(); // Ensure the scroll is triggered when a message arrives
  }, [message, scrollToBottom]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(displayedMessage);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleThumbsDown = () => {
    onThumbsDown(displayedMessage);
  };

  const handleFeedbackSubmit = (rating: number, feedback: string) => {
    console.log("Rating:", rating, "Feedback:", feedback);
  };

  const messageStyle =
    type === "user" ? "bg-gray-200 text-black" : "bg-custom_blue text-black";

  return (
    <div
      className={`flex ${type === "user" ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0">
          {type === "user" ? (
            <FaRegUser className="text-blue-500" size={24} />
          ) : (
            <RiRobot2Line className="text-green-500" size={24} />
          )}
        </div>
        <div className={`rounded-lg p-4 ${messageStyle} shadow-md`}>
          <>
            <ReactMarkdown
              className="react-markdown"
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <SyntaxHighlighter
                      style={okaidia}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {displayedMessage}
            </ReactMarkdown>
            {type === "assistant" && (
              <div className="flex justify-end mt-2 space-x-4">
                {copied ? (
                  <MdCheck className="text-white-500" size={20} />
                ) : (
                  <MdContentCopy
                    className="cursor-pointer hover:text-gray-600"
                    onClick={handleCopyToClipboard}
                    size={20}
                  />
                )}
                <MdOutlineFeedback
                  className="cursor-pointer hover:text-gray-600"
                  onClick={() => setIsFeedbackOpen(true)}
                  size={20}
                />
              </div>
            )}
          </>
        </div>
      </div>
      {isFeedbackOpen && (
        <FeedbackPopup
          onClose={() => setIsFeedbackOpen(false)}
          onSubmit={handleFeedbackSubmit}
          messageId={message.message_id}
        />
      )}
    </div>
  );
};

export default ChatMessage;
