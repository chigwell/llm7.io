import React from 'react';

function App() {
  const models = [
    'gpt-4o-mini-2024-07-18',
    'gpt-4o',
    'qwen2.5-coder-32b-instruct:int8',
    'llama-3.3-70b-instruct-fp8-fast',
    'mistral-small-2503',
    'phi-4',
    'gemini-2.0-flash',
    'deepseek-v3',
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
      <img src="/logo.png" alt="LLM7 Logo" className="w-40 h-40 mb-8" />

      <h1 className="text-3xl font-bold mb-4">LLM7.io</h1>
      <p className="text-center mb-6 text-gray-700 px-4">
        A free, anonymous LLM provider without authorization.<br />
        Just start using powerful models instantly.
      </p>

      <h2 className="text-xl font-semibold mb-2">Example Usage</h2>
      <pre className="bg-gray-800 text-white p-4 rounded-lg shadow-md">
{`import { OpenAI } from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.llm7.io/v1',
  apiKey: 'unused',
});

const response = await client.chat.completions.create({
  model: 'gpt-4o-mini-2024-07-18',
  messages: [{ role: 'user', content: 'Tell me a story.' }],
});

console.log(response.choices[0].message.content);`}
      </pre>

      <h2 className="text-xl font-semibold mt-6 mb-2">Available Models</h2>
      <ul className="list-disc list-inside text-gray-600">
        {models.map((model) => (
          <li key={model}>{model}</li>
        ))}
      </ul>

      <footer className="mt-12 text-sm text-gray-500">
        © 2025 LLM7.io
      </footer>
    </div>
  );
}

export default App;
