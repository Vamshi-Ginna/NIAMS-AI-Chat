import React, { useState, useEffect, useRef } from 'react';
import { FaPaperclip } from 'react-icons/fa';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileChange: (file: File) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onFileChange }) => {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (input.trim() !== '') {
      onSendMessage(input);
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 7 * 24)}px`;
    }
  }, [input]);

  return (
    <div className="p-3 bg-gray-100 border-t border-gray-200">
      <div className="flex items-center bg-white rounded-lg shadow-md p-2">
        {/* Attachment Button */}
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
        >
          <FaPaperclip size={18} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          className="flex-1 border rounded-lg p-2 ml-3 resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          style={{ maxHeight: '168px' }} // 7 lines * 24px line height
        />

        {/* Send Button */}
        <button 
          onClick={handleSendMessage} 
          className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
        >
          Send
        </button>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-sm text-gray-500 mt-2">
        Disclaimer: This Secure AI Chat workspace is not used to train ChatGPT models. LCG Secure AI Chat can make mistakes.
      </div>
    </div>
  );
};

export default ChatInput;
