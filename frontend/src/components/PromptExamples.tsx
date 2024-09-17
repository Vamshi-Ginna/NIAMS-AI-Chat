import React from "react";

const PromptExamples: React.FC = () => {
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Specific Prompt Examples for Common Use Cases
      </h2>
      <p className="mb-6">
        Here are tailored prompt examples for some common NIH use cases to help
        you effectively use the NIAMS AI ChatBot’s capabilities.
      </p>

      {/* Text Summarization */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-2">
          Text Summarization
        </h3>
        <p className="text-gray-700 mb-4">
          <strong>Purpose:</strong> Summarize long articles, research papers, or
          documents into concise overviews. You can either copy the content into
          the prompt input textbox or upload your document to summarize using
          the upload icon next to the input textbox.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600">
            <strong>Prompt Example:</strong> "Summarize the key findings of this
            research paper on the effects of CRISPR-Cas9 in gene therapy within
            200 words."
          </p>
          <p className="text-gray-600 mt-2">
            <strong>Prompt Example:</strong> "Provide a summary of the latest
            NIH guidelines on clinical trial design, focusing on changes related
            to patient recruitment."
          </p>
        </div>
      </div>

      {/* Creative Content Generation */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-2">
          Creative Content Generation
        </h3>
        <p className="text-gray-700 mb-4">
          <strong>Purpose:</strong> Generate stories, compose emails, or create
          project ideas, even writing poetry on chosen topics.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600">
            <strong>Prompt Example:</strong> "Draft an email to NIH colleagues
            summarizing our recent meeting on the AI-powered drug discovery
            project and outline next steps."
          </p>
          <p className="text-gray-600 mt-2">
            <strong>Prompt Example:</strong> "Compose a poem that reflects the
            challenges and triumphs of biomedical research."
          </p>
        </div>
      </div>

      {/* Language Translations */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-2">
          Language Translations
        </h3>
        <p className="text-gray-700 mb-4">
          <strong>Purpose:</strong> Translate phrases, sentences, or paragraphs
          from one language to another to facilitate communication.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600">
            <strong>Prompt Example:</strong> "Translate this abstract on
            Alzheimer's research from English to Spanish."
          </p>
          <p className="text-gray-600 mt-2">
            <strong>Prompt Example:</strong> "Convert the following patient
            consent form from English to French, ensuring medical terminology is
            accurately translated."
          </p>
        </div>
      </div>

      {/* Simulating Specific Personas
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-2">
          Simulating Specific Personas
        </h3>
        <p className="text-gray-700 mb-4">
          <strong>Purpose:</strong> Engage in dialogues with the AI simulating
          historical figures, experts, or fictional characters.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600">
            <strong>Prompt Example:</strong> "As Dr. Francis Collins, explain
            the impact of the Human Genome Project on modern medicine."
          </p>
          <p className="text-gray-600 mt-2">
            <strong>Prompt Example:</strong> "Simulate a discussion with Albert
            Einstein on the implications of quantum mechanics in neurological
            research."
          </p>
        </div>
      </div> */}

      {/* Engaging in Technical Dialogues */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-2">
          Engaging in Technical Dialogues
        </h3>
        <p className="text-gray-700 mb-4">
          <strong>Purpose:</strong> Pose technical or specialized questions
          related to your field of work or study.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600">
            <strong>Prompt Example:</strong> "Explain the latest advancements in
            deep brain stimulation therapy for Parkinson’s disease."
          </p>
          <p className="text-gray-600 mt-2">
            <strong>Prompt Example:</strong> "Describe the most effective data
            analysis techniques for handling large-scale genomics datasets."
          </p>
        </div>
      </div>

      {/* Instructional Guidance */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-2">
          Instructional Guidance
        </h3>
        <p className="text-gray-700 mb-4">
          <strong>Purpose:</strong> Seek step-by-step guidance on processes like
          software use, experimental protocols, or troubleshooting.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600">
            <strong>Prompt Example:</strong> "Guide me through the process of
            setting up a next-generation sequencing experiment, including sample
            preparation and data analysis."
          </p>
          <p className="text-gray-600 mt-2">
            <strong>Prompt Example:</strong> "Provide step-by-step instructions
            for using SPSS to perform a regression analysis on epidemiological
            data."
          </p>
        </div>
      </div>

      {/* General Knowledge and Trivia */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-2">
          General Knowledge
        </h3>
        <p className="text-gray-700 mb-4">
          <strong>Purpose:</strong> Ask questions about general knowledge, or
          facts on a wide range of topics.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600">
            <strong>Prompt Example:</strong> "What are the key historical
            milestones in the development of modern vaccines?"
          </p>
          <p className="text-gray-600 mt-2">
            <strong>Prompt Example:</strong> "List interesting trivia about the
            history of NIH and its contributions to public health."
          </p>
        </div>
      </div>

      <p>
        These examples are designed to help NIAMS scientific and technical users
        maximize the utility of the AI, whether for research, communication, or
        creative exploration.
      </p>
    </div>
  );
};

export default PromptExamples;
