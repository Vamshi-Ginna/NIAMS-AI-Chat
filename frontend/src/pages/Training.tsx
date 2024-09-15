import React from 'react';
import { FiExternalLink, FiBookOpen, FiMessageCircle } from 'react-icons/fi';

const Training: React.FC = () => {
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

          {/* FAQ Section */}
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Frequently Asked Questions (FAQ)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">What is the NIAMS AI platform?</h3>
                <p className="text-gray-600">
                  The NIAMS AI platform is a secure, cloud-based system designed to provide AI-powered tools and services that comply with U.S. government standards for data security and privacy.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">How can I access the AI Chat?</h3>
                <p className="text-gray-600">
                  You can access the AI Chat tool via the NIAMS portal after logging in with your credentials. Make sure to review the official documentation for detailed instructions on usage.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Where can I find more resources on AI?</h3>
                <p className="text-gray-600">
                  You can explore our tutorials and blog posts linked above for more detailed resources on how to leverage AI within your workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Training;
