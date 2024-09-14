import React, { useState, useRef, useEffect } from 'react';
import { FaPaperclip, FaArrowCircleRight } from 'react-icons/fa';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileChange: (file: File) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onFileChange }) => {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileChange(event.target.files[0]);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="p-0 bg-grey-500">
      <div className="flex items-center bg-grey rounded-full p-2 shadow-sm border border-pinkish relative">
        {/* Attachment Button with Tooltip */}
        <div className="relative">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-pinkish_dark transition-colors focus:outline-none"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <FaPaperclip size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full mb-2 bg-gray-700 text-white text-xs rounded-lg py-1 px-2 shadow-lg whitespace-nowrap">
              Attach File
            </div>
          )}
        </div>

        {/* Message Textarea */}
        <textarea
          ref={textareaRef}
          className="flex-1 px-4 py-2 border-none focus:outline-none resize-none placeholder-gray-400"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          style={{ maxHeight: '168px' }}
        />

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          className={`p-2 rounded-full transition-all focus:outline-none ${
            input.trim() ? 'bg-pinkish_dark text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!input.trim()}
        >
          <FaArrowCircleRight size={20} />
        </button>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-xs text-gray-500 mt-1">
        This Secure AI Chat workspace is not used to train models. Mistakes can happen.
      </div>
    </div>
  );
};

export default ChatInput;
