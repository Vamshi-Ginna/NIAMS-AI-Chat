import React from 'react';
import { FaTimesCircle, FaCheckCircle } from 'react-icons/fa';

const BestPractices: React.FC = () => {
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Best Practices for Writing Prompts</h2>

      {/* Practice 1: Be Specific */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-2">Be Specific</h3>
        <p className="text-gray-700 mb-4">
          <strong>Why:</strong> The more specific you are, the less room there is for misinterpretation. Clear, concise prompts help the model understand exactly what you need.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 flex items-center">
            <FaTimesCircle className="text-red-500 mr-2" />
            <strong>Less Specific:</strong> "Tell me about climate change."
          </p>
          <p className="text-gray-600 mt-2 flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" />
            <strong>More Specific:</strong> "Summarize the main causes of climate change, focusing on industrial emissions."
          </p>
        </div>
      </div>

      {/* Practice 2: Be Descriptive */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-2">Be Descriptive</h3>
        <p className="text-gray-700 mb-4">
          <strong>Why:</strong> Using detailed descriptions or analogies can guide the model to generate more accurate and relevant responses.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 flex items-center">
            <FaTimesCircle className="text-red-500 mr-2" />
            <strong>Less Descriptive:</strong> "Explain machine learning."
          </p>
          <p className="text-gray-600 mt-2 flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" />
            <strong>More Descriptive:</strong> "Explain machine learning as if you’re teaching a beginner, using the analogy of teaching a child to recognize animals."
          </p>
        </div>
      </div>

      {/* Practice 3: Double Down on Instructions */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-2">Double Down on Instructions</h3>
        <p className="text-gray-700 mb-4">
          <strong>Why:</strong> Repeating instructions or placing them in key areas of your prompt can reinforce what you want the model to do. This can be especially useful for complex queries.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 flex items-center">
            <FaTimesCircle className="text-red-500 mr-2" />
            <strong>Initial Prompt:</strong> "List the steps for setting up a new user in the system."
          </p>
          <p className="text-gray-600 mt-2 flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" />
            <strong>Enhanced Prompt:</strong> "List the steps for setting up a new user in the system. Make sure to start with the system login process and end with the account activation."
          </p>
        </div>
      </div>

      {/* Practice 4: Order Matters */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-2">Order Matters</h3>
        <p className="text-gray-700 mb-4">
          <strong>Why:</strong> The order in which you present your information can impact the quality of the response. Start with instructions and follow with the content or examples you want the model to process.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 flex items-center">
            <FaTimesCircle className="text-red-500 mr-2" />
            <strong>Content First:</strong> "[Article Text] Summarize the above article."
          </p>
          <p className="text-gray-600 mt-2 flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" />
            <strong>Instruction First:</strong> "Summarize the following article: [Article Text]"
          </p>
        </div>
      </div>

      {/* Practice 5: Give the Model an 'Out' */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-2">Give the Model an 'Out'</h3>
        <p className="text-gray-700 mb-4">
          <strong>Why:</strong> Sometimes, the model may not have enough information to generate a correct response. Providing an alternative path, like responding with "not found," can prevent it from making up information.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600 flex items-center">
            <FaTimesCircle className="text-red-500 mr-2" />
            <strong>Without 'Out':</strong> "What is the meaning of life according to the text?"
          </p>
          <p className="text-gray-600 mt-2 flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" />
            <strong>With 'Out':</strong> "What is the meaning of life according to the text? If not found in the text, respond with 'not found.'"
          </p>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-2">Additional Resources</h3>
        <p className="text-gray-700 mb-4">
          For more in-depth guidance on prompt engineering, explore the following resources:
        </p>
        <ul className="list-disc list-inside text-indigo-600">
          <li>
            <a href="https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Azure OpenAI Prompt Engineering Concepts
            </a>
          </li>
          <li>
            <a href="https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api" target="_blank" rel="noopener noreferrer" className="hover:underline">
              OpenAI Best Practices for Prompt Engineering
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BestPractices;
