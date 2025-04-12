import React, { useState, useEffect, useMemo } from 'react';
import LiveExample from './LiveExample';
import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function RedirectKofi() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/redirect/kofi') {
      window.location.href = 'https://ko-fi.com/llm7_io';
    }
  }, [location]);

  return null;
}


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
    '        {"role": "user", "content": "Tell me a short story about a brave squirrel."}',
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
    <pre style={{ minHeight: '320px' }}
        className="bg-gray-800 text-white p-2 md:p-4 rounded-lg shadow-md font-mono overflow-x-auto text-xs md:text-sm w-full max-w-4xl mx-4">
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
  <Router>
      <Routes>
        <Route path="/redirect/kofi" element={<RedirectKofi />} />
        {/* Другие маршруты */}
        <Route path="/" element={
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
      <img src="/logo.png" alt="LLM7 Logo" className="w-40 h-40 mt-8 mb-8" />

      <h1 className="text-3xl font-bold mb-4">LLM7.io</h1>
      <p className="text-center mb-6 text-gray-700 px-4">
        A free, anonymous LLM provider without authorization.<br />
        Just start using powerful models instantly.
      </p>

      <div className="flex justify-center items-center flex-wrap space-x-2 mb-8">

        <a href="https://badge.fury.io/py/langchain-llm7" target="_blank" rel="noopener noreferrer">
            <img src="https://badge.fury.io/py/langchain-llm7.svg" alt="PyPI version" />
        </a>
        <a href="https://pepy.tech/project/langchain-llm7" target="_blank" rel="noopener noreferrer">
             <img src="https://static.pepy.tech/badge/langchain-llm7" alt="PyPI Downloads" />
        </a>
        <a href="https://www.npmjs.com/package/langchain-llm7" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/npm/v/langchain-llm7" alt="NPM Version" />
        </a>
        <a href="https://www.npmjs.com/package/langchain-llm7" target="_blank" rel="noopener noreferrer">
          <img src="https://img.shields.io/npm/dy/langchain-llm7" alt="NPM Daily Downloads" />
        </a>
        <a href="https://www.npmjs.com/package/langchain-llm7" target="_blank" rel="noopener noreferrer">
           <img src="https://img.shields.io/npm/last-update/langchain-llm7" alt="NPM Last Update" />
        </a>
        <a href="https://opensource.org/licenses/Apache-2.0" target="_blank" rel="noopener noreferrer">
             <img src="https://img.shields.io/pypi/l/langchain-llm7?color=%2340b814" alt="License: Apache 2.0" />
        </a>
        <a href="https://api.llm7.io/" target="_blank" rel="noopener noreferrer">
             <img src="https://img.shields.io/badge/max_rate-150%20per%20min-brightgreen" alt="max rate: 150 requests per minute" />
        </a>
      </div>
      {/* END: Added Badges Section */}

      <h2 className="text-xl font-semibold mb-2">Example Usage</h2>
      <ConsoleAnimation />
      <LiveExample />

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
    } />
      </Routes>
    </Router>
  );
}

export default App;