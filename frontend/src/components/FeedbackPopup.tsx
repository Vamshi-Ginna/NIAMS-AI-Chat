import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

interface FeedbackPopupProps {
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
}

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ onClose, onSubmit }) => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');

  const handleSubmit = () => {
    onSubmit(rating, feedback);
    onClose(); // Close the popup after submission
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Rate the Answer</h2>
        <div className="flex mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`cursor-pointer ${star <= (hover || rating) ? 'text-yellow-500' : 'text-gray-300'}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(rating)}
            />
          ))}
        </div>
        <textarea
          className="w-full border rounded p-2 mb-4"
          placeholder="Provide your feedback..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
        />
        <div className="flex justify-end">
          <button onClick={onClose} className="bg-gray-300 text-gray-800 rounded px-4 py-2 mr-2">Cancel</button>
          <button onClick={handleSubmit} className="bg-blue-500 text-white rounded px-4 py-2">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPopup;