import React, { useState, useEffect, useMemo } from 'react';

function ConsoleAnimation() {
  const [lines, setLines] = useState([]);
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');

  const commands = useMemo(() => [
    'import openai',
    '',
    'client = openai.OpenAI(',
    '    base_url="https://api.llm7.io/v1",',
    '    api_key="unused"',
    ')',
    '',
    'response = client.chat.completions.create(',
    '    model="gpt-4o-mini-2024-07-18",',
    '    messages=[',
    '        {"role": "user", "content": "Tell me a story."}',
    '    ]',
    ')',
    '',
    'print(response.choices[0].message.content)'
  ], []);

  useEffect(() => {
    if (currentCommandIndex >= commands.length) return;

    const command = commands[currentCommandIndex];
    let i = 0;

    // Immediately add first character for new line
    if (command.length > 0) {
      setCurrentText(command.charAt(0));
      i = 1;
    }

    const interval = setInterval(() => {
      if (i < command.length) {
        setCurrentText(prev => prev + command.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        setLines(prev => [...prev, command]);
        setCurrentText('');

        setTimeout(() => {
          setCurrentCommandIndex(prev => prev + 1);
        }, command === '' ? 0 : 400);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [currentCommandIndex, commands]);

  return (
    <pre className="bg-gray-800 text-white p-2 md:p-4 rounded-lg shadow-md font-mono overflow-x-auto text-xs md:text-sm w-full max-w-4xl mx-4">
      {lines.join('\n')}
      {lines.length > 0 && '\n'}
      {currentText}
      <span className="animate-pulse">█</span>
    </pre>
  );
}


function App() {
  const [models, setModels] = useState([]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('https://api.llm7.io/v1/models');
        const data = await response.json();
        setModels(data.map(model => model.id));
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };

    fetchModels();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
      <img src="/logo.png" alt="LLM7 Logo" className="w-40 h-40 mt-8 mb-8" />

      <h1 className="text-3xl font-bold mb-4">LLM7.io</h1>
      <p className="text-center mb-6 text-gray-700 px-4">
        A free, anonymous LLM provider without authorization.<br />
        Just start using powerful models instantly.
      </p>

      <h2 className="text-xl font-semibold mb-2">Example Usage</h2>
      <ConsoleAnimation />

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Available Models
        <a
          href="https://api.llm7.io/v1/models"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-blue-600 hover:text-blue-800"
        >
          (view all)
        </a>
      </h2>
      <ul className="list-disc list-inside text-gray-600">
        {models.map((model) => (
          <li key={model}>{model}</li>
        ))}
      </ul>

      <footer className="mt-12 mb-4 text-sm text-gray-500">
        © 2025 LLM7.io ·
        <a
          href="https://www.linkedin.com/in/eugene-evstafev-716669181/"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-blue-600 hover:text-blue-800"
        >
          Created by Eugene Evstafev
        </a>
      </footer>
    </div>
  );
}

export default App;