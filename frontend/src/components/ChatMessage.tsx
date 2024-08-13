import React, { useEffect, useState } from 'react';
import { FaRegUser } from 'react-icons/fa';
import { MdOutlineFeedback } from "react-icons/md";
import { RiRobot2Line } from "react-icons/ri";
import { MdContentCopy } from "react-icons/md";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';
import FeedbackPopup from './FeedbackPopup';

interface ChatMessageProps {
  message: any;
  type: string;
  isLoading?: boolean;
  isNew: boolean; // Added isNew as required
  onThumbsDown: (message: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, type, isLoading, isNew, onThumbsDown }) => {
  const [displayedMessage, setDisplayedMessage] = useState<string>(isNew ? '' : message.content);
  const [copied, setCopied] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    if (isNew && !isLoading) {
      let i = 0;
      const content = typeof message === 'string' ? message : message.content;

      const interval = setInterval(() => {
        setDisplayedMessage(content.slice(0, i));
        i++;
        if (i > content.length) {
          clearInterval(interval);
        }
      }, 10);

      return () => clearInterval(interval);
    } else {
      setDisplayedMessage(message.content); // Display full message immediately if it's not new
    }
  }, [message, isNew, isLoading]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(displayedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleThumbsDown = () => {
    onThumbsDown(displayedMessage);
  };

  const handleFeedbackSubmit = (rating: number, feedback: string) => {
    console.log('Rating:', rating, 'Feedback:', feedback);
    // Trigger backend function to save the feedback
  };

  const messageStyle = type === 'user' ? 'bg-blue-200' : 'bg-green-200';

  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="flex items-center space-x-2">
        <div className="flex-shrink-0 icon-size">
          {type === 'user' ? <FaRegUser /> : <RiRobot2Line />}
        </div>
        <div className={`rounded p-2 ${messageStyle} chat-bubble`}>
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
                      <SyntaxHighlighter
                        style={okaidia}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
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
                <div className="flex justify-end mt-2 space-x-2">
                  <MdContentCopy className="cursor-pointer" onClick={handleCopyToClipboard} />
                  <MdOutlineFeedback className="cursor-pointer" onClick={() => setIsFeedbackOpen(true)} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {copied && (
        <div className="copied-popup bg-white text-black rounded-lg p-2 mt-2">
          Copied
        </div>
      )}
      {isFeedbackOpen && (
        <FeedbackPopup
          onClose={() => setIsFeedbackOpen(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};

export default ChatMessage;