import React from "react";
import {
  FiBookOpen,
  FiMessageCircle,
  FiRepeat,
  FiCpu,
  FiInfo,
  FiChevronRight,
} from "react-icons/fi";

interface PromptsAndInteractionsProps {
  onCardClick: (message: string) => void;
  userName: string;
}

const PromptsAndInteractions: React.FC<PromptsAndInteractionsProps> = ({
  onCardClick,
  userName,
}) => {
  return (
    <div className="p-4 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        Welcome to NIAMS AI Chat, {userName}!
      </h1>
      {/* Image above the cards */}
      <div className="w-full flex justify-center mb-6">
        <img src="/workers.png" alt="Workers" className="w-full max-w-xl" />
      </div>

      {/* Update grid layout to fit 5 cards in one row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl">
        {/* Text Summarization */}
        <div className="bg-blue-50 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
          <div className="flex items-center">
            <FiBookOpen className="text-blue-600 text-xl mr-2" />
            <h3 className="text-sm font-semibold text-gray-800">
              Text Summarization
            </h3>
          </div>
          <p className="text-gray-600 text-xs mt-1">
            Summarize long articles, research papers, or documents into concise
            overviews.
          </p>
          <button
            className="mt-2 text-blue-600 text-sm flex items-center font-semibold hover:underline"
            onClick={() =>
              onCardClick(
                "Could you please summarize the text for me? Let me know if you need more context or specific sections to focus on."
              )
            }
          >
            Try it now <FiChevronRight className="ml-1" />
          </button>
        </div>

        {/* Creative Content Generation */}
        <div className="bg-green-50 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
          <div className="flex items-center">
            <FiMessageCircle className="text-green-600 text-xl mr-2" />
            <h3 className="text-sm font-semibold text-gray-800">
              Creative Content Generation
            </h3>
          </div>
          <p className="text-gray-600 text-xs mt-1">
            Compose emails, or brainstorm project ideas with AI's creative
            assistance.
          </p>
          <button
            className="mt-2 text-green-600 text-sm flex items-center font-semibold hover:underline"
            onClick={() =>
              onCardClick(
                "I’m looking for help with generating creative content. Could you assist me in brainstorming ideas? Feel free to ask for more details."
              )
            }
          >
            Try it now <FiChevronRight className="ml-1" />
          </button>
        </div>

        {/* Language Translations */}
        <div className="bg-yellow-50 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
          <div className="flex items-center">
            <FiRepeat className="text-yellow-600 text-xl mr-2" />
            <h3 className="text-sm font-semibold text-gray-800">
              Language Translations
            </h3>
          </div>
          <p className="text-gray-600 text-xs mt-1">
            Translate text between languages to facilitate communication across
            language barriers.
          </p>
          <button
            className="mt-2 text-yellow-600 text-sm flex items-center font-semibold hover:underline"
            onClick={() =>
              onCardClick(
                "I need assistance translating a text into another language. Could you please assist me? Let me know if you need more details."
              )
            }
          >
            Try it now <FiChevronRight className="ml-1" />
          </button>
        </div>

        {/* Engaging in Technical Dialogues */}
        <div className="bg-red-50 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
          <div className="flex items-center">
            <FiCpu className="text-red-600 text-xl mr-2" />
            <h3 className="text-sm font-semibold text-gray-800">
              Engaging in Technical Dialogues
            </h3>
          </div>
          <p className="text-gray-600 text-xs mt-1">
            Ask specialized or technical questions related to research, AI, or
            other fields.
          </p>
          <button
            className="mt-2 text-red-600 text-sm flex items-center font-semibold hover:underline"
            onClick={() =>
              onCardClick(
                "I have a technical question and would appreciate your help. Please ask for any clarifications you need."
              )
            }
          >
            Try it now <FiChevronRight className="ml-1" />
          </button>
        </div>

        {/* General Knowledge & Trivia */}
        <div className="bg-teal-50 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
          <div className="flex items-center">
            <FiInfo className="text-teal-600 text-xl mr-2" />
            <h3 className="text-sm font-semibold text-gray-800">
              General Knowledge
            </h3>
          </div>
          <p className="text-gray-600 text-xs mt-1">
            Ask questions on a wide range of topics from science and policy to
            Information Technology and tools.
          </p>
          <button
            className="mt-2 text-teal-600 text-sm flex items-center font-semibold hover:underline"
            onClick={() =>
              onCardClick(
                "I’m interested in learning some fascinating trivia or general knowledge. Could you share information on various topics?"
              )
            }
          >
            Try it now <FiChevronRight className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptsAndInteractions;
