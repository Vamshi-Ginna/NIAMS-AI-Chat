export const bestPractices = [
    {
      title: 'Be Specific',
      why: 'The more specific you are, the less room there is for misinterpretation. Clear, concise prompts help the model understand exactly what you need.',
      examples: {
        lessSpecific: 'Tell me about climate change.',
        moreSpecific: 'Summarize the main causes of climate change, focusing on industrial emissions.'
      }
    },
    {
      title: 'Be Descriptive',
      why: 'Using detailed descriptions or analogies can guide the model to generate more accurate and relevant responses.',
      examples: {
        lessDescriptive: 'Explain machine learning.',
        moreDescriptive: 'Explain machine learning as if you’re teaching a beginner, using the analogy of teaching a child to recognize animals.'
      }
    },
    {
      title: 'Double Down on Instructions',
      why: 'Repeating instructions or placing them in key areas of your prompt can reinforce what you want the model to do. This can be especially useful for complex queries.',
      examples: {
        initialPrompt: 'List the steps for setting up a new user in the system.',
        enhancedPrompt: 'List the steps for setting up a new user in the system. Make sure to start with the system login process and end with the account activation.'
      }
    },
    {
      title: 'Order Matters',
      why: 'The order in which you present your information can impact the quality of the response. Start with instructions and follow with the content or examples you want the model to process.',
      examples: {
        contentFirst: '[Article Text] Summarize the above article.',
        instructionFirst: 'Summarize the following article: [Article Text]'
      }
    },
    {
      title: 'Give the Model an \'Out\'',
      why: 'Sometimes, the model may not have enough information to generate a correct response. Providing an alternative path, like responding with "not found," can prevent it from making up information.',
      examples: {
        withoutOut: 'What is the meaning of life according to the text?',
        withOut: 'What is the meaning of life according to the text? If not found in the text, respond with "not found."'
      }
    }
  ];
  