import React, { useState, useEffect, useRef } from 'react';
import { FaRegUser } from 'react-icons/fa';
import { MdOutlineFeedback, MdContentCopy, MdCheck } from 'react-icons/md'; // Added MdCheck for tick mark
import { RiRobot2Line } from 'react-icons/ri';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';
import FeedbackPopup from './FeedbackPopup';

interface ChatMessageProps {
  message: any;
  type: string;
  isLoading?: boolean;
  isNew: boolean;
  onThumbsDown: (message: string) => void;
  onTypingComplete?: () => void; 
  scrollToBottom: () => void; // Accept scrollToBottom as a prop
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  type,
  isLoading,
  isNew,
  onThumbsDown,
  onTypingComplete,
  scrollToBottom // Scroll function passed as prop
}) => {
  const [displayedMessage, setDisplayedMessage] = useState<string>(isNew ? '' : message.content);
  const [copied, setCopied] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const content = typeof message === 'string' ? message : message.content;

    if (isNew && !isLoading) {
      let i = 0;

      const interval = setInterval(() => {
        setDisplayedMessage(content.slice(0, i));
        i++;

        // Call scrollToBottom during the typing effect
        scrollToBottom();

        if (i > content.length) {
          clearInterval(interval);
          // Call the callback to inform the parent that typing is complete
          if (onTypingComplete) {
            onTypingComplete();
          }
        }
      }, 1);

      return () => clearInterval(interval);
    } else {
      setDisplayedMessage(content); // Display the full message immediately if it's not new or has already been typed
    }
  }, [message, isNew, isLoading, onTypingComplete, scrollToBottom]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(displayedMessage);
    setCopied(true);

    // Automatically revert back to copy icon after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleThumbsDown = () => {
    onThumbsDown(displayedMessage);
  };

  const handleFeedbackSubmit = (rating: number, feedback: string) => {
    console.log('Rating:', rating, 'Feedback:', feedback);
    // Trigger backend function to save the feedback
  };

  const messageStyle = type === 'user' ? 'bg-gray-200 text-black' : 'bg-custom_blue text-black';

  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0">
          {type === 'user' ? (
            <FaRegUser className="text-blue-500" size={24} />
          ) : (
            <RiRobot2Line className="text-green-500" size={24} />
          )}
        </div>
        <div className={`rounded-lg p-4 ${messageStyle} shadow-md`}>
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            <>
              <ReactMarkdown
                className="react-markdown"
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <SyntaxHighlighter style={okaidia} language={match[1]} PreTag="div" {...props}>
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  a({ href, children, ...props }) {
                    return (
                      <a href={href} className="text-blue-600 underline" {...props}>
                        {children}
                      </a>
                    );
                  }
                }}
              >
                {displayedMessage}
              </ReactMarkdown>
              {type === 'assistant' && (
                <div className="flex justify-end mt-2 space-x-4">
                  {/* Show tick mark when copied, else show copy icon */}
                  {copied ? (
                    <MdCheck className="text-white-500" size={20} />
                  ) : (
                    <MdContentCopy className="cursor-pointer hover:text-gray-600" onClick={handleCopyToClipboard} size={20} />
                  )}
                  <MdOutlineFeedback className="cursor-pointer hover:text-gray-600" onClick={() => setIsFeedbackOpen(true)} size={20} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {isFeedbackOpen && (
        <FeedbackPopup
          onClose={() => setIsFeedbackOpen(false)}
          onSubmit={handleFeedbackSubmit}
          messageId={message.message_id} // Pass the message_id to FeedbackPopup
        />
      )}
    </div>
  );
};

export default ChatMessage;
