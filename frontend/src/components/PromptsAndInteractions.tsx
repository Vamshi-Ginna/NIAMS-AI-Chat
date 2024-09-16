import React from "react";
import {
  FiBookOpen,
  FiMessageCircle,
  FiRepeat,
  FiUserCheck,
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
      <br></br>
      <br></br>
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        Welcome! {userName}{" "}
      </h1>
      <div className="grid grid-cols-2 gap-4 max-w-4xl">
        {/* Text Summarization */}
        <div className="bg-blue-50 p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
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
                "Could you please summarize the text for me? Let me know if you need more context or specific sections to focus on"
              )
            }
          >
            Try it now <FiChevronRight className="ml-1" />
          </button>
        </div>

        {/* Creative Content Generation */}
        <div className="bg-green-50 p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
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
                "I’m looking for help with generating creative content. Could you assist me in brainstorming ideas? Feel free to ask for more details to guide the process."
              )
            }
          >
            Try it now <FiChevronRight className="ml-1" />
          </button>
        </div>

        {/* Language Translations */}
        <div className="bg-yellow-50 p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
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
                "I need assistance translating a text into another language. Could you please assist me? Let me know if you need the target language or any specific context for an accurate translation."
              )
            }
          >
            Try it now <FiChevronRight className="ml-1" />
          </button>
        </div>

        {/* Simulating Personas */}
        {/*
        <div
          className="bg-purple-50 p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out" >
          <div className="flex items-center">
            <FiUserCheck className="text-purple-600 text-xl mr-2" />
            <h3 className="text-sm font-semibold text-gray-800">Simulating Personas</h3>
          </div>
          <p className="text-gray-600 text-xs mt-1">Engage with the AI as it simulates experts, historical figures, or fictional characters.</p>
          <button className="mt-2 text-purple-600 text-sm flex items-center font-semibold hover:underline"
                  onClick={() => onCardClick('Can you simulate a conversation with a specific persona, such as an expert or historical figure, to help me better understand a particular topic or scenario? Ask me any questions to clarify the persona or subject before you proceed.')}
          >
            Try it now <FiChevronRight className="ml-1" />
          </button>
        </div>
        */}

        {/* Engaging in Technical Dialogues */}
        <div className="bg-red-50 p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
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
                "I have a technical question and would appreciate your help. Please ask for any additional details or clarifications you need before providing an answer."
              )
            }
          >
            Try it now <FiChevronRight className="ml-1" />
          </button>
        </div>

        {/* General Knowledge & Trivia */}
        <div className="bg-teal-50 p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
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
                "I’m interested in learning some fascinating trivia or general knowledge. Could you share information on a wide range of topics? Feel free to ask what specific topics I am most interested in."
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
