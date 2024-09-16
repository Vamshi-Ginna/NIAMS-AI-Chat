import React, { useState } from 'react';
import { FiExternalLink, FiBookOpen, FiMessageCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { faqs } from '../data/Faqs';
import BestPractices from '../components/BestPractices';
import PromptExamples from '../components/PromptExamples';

const Training: React.FC = () => {
  // State for tracking which FAQ item is open
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isBestPracticesOpen, setIsBestPracticesOpen] = useState(true);
  const [isPromptExamplesOpen, setIsPromptExamplesOpen] = useState(true);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="p-8">
          {/* Training Resources Section */}
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Training Resources</h1>
          <p className="text-gray-600 mb-6">
            Below are useful links to external resources that provide further insights into the NIAMS AI platform, including official documentation, blog posts, and tutorials to help you get started.
          </p>

          <ul className="space-y-4">
            <li className="flex items-center">
              <FiBookOpen className="text-indigo-600 text-2xl mr-3" />
              <a href="https://example.com/docs" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                Official Documentation
              </a>
            </li>
            <li className="flex items-center">
              <FiMessageCircle className="text-indigo-600 text-2xl mr-3" />
              <a href="https://example.com/blog" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                Blog Post: How to Leverage AI for Efficiency
              </a>
            </li>
            <li className="flex items-center">
              <FiExternalLink className="text-indigo-600 text-2xl mr-3" />
              <a href="https://example.com/tutorials" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                Tutorials and Guides
              </a>
            </li>
          </ul>

          <hr className="my-8" />

          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
                How to Write Effective Prompts for the Best AI Responses
            </h2>
            <p className="text-lg text-gray-700">
                When interacting with the NIAMS AI chatbot, crafting clear and effective prompts is key to getting the information you need. Here’s a guide to help you write prompts that will yield the best results.
            </p>
            </div>

          {/* Best Practices Collapsible Section */}
          <div className="mb-8">
            <button
              className="flex justify-between items-center w-full bg-indigo-600 text-white p-4 rounded-lg"
              onClick={() => setIsBestPracticesOpen(!isBestPracticesOpen)}
            >
              <span className="text-xl font-semibold">Best Practices for Writing Prompts</span>
              {isBestPracticesOpen ? <FiChevronUp className="text-2xl" /> : <FiChevronDown className="text-2xl" />}
            </button>
            {isBestPracticesOpen && (
              <div className="mt-4">
                <BestPractices />
              </div>
            )}
          </div>

          {/* Specific Prompt Examples Collapsible Section */}
          <div className="mb-8">
            <button
              className="flex justify-between items-center w-full bg-indigo-600 text-white p-4 rounded-lg"
              onClick={() => setIsPromptExamplesOpen(!isPromptExamplesOpen)}
            >
              <span className="text-xl font-semibold">Specific Prompt Examples for Common Use Cases</span>
              {isPromptExamplesOpen ? <FiChevronUp className="text-2xl" /> : <FiChevronDown className="text-2xl" />}
            </button>
            {isPromptExamplesOpen && (
              <div className="mt-4">
                <PromptExamples />
              </div>
            )}
          </div>
          {/* FAQ Section */}
          <h2 className="text-2xl font-semibold mt-4 mb-4 text-gray-800">Frequently Asked Questions (FAQs)</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-300 rounded-lg">
                <button
                  className="w-full flex justify-between items-center p-4 bg-white text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-semibold text-gray-700">{faq.question}</span>
                  {openFaq === index ? (
                    <FiChevronUp className="text-indigo-600" />
                  ) : (
                    <FiChevronDown className="text-indigo-600" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="p-4 bg-gray-100 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;
