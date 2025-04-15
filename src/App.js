import React, { useState, useEffect, useMemo } from 'react';
import LiveExample from './LiveExample';
import StatsChart from './StatsChart';
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
  const [statsData, setStatsData] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('https://api.llm7.io/v1/models');
        const data = await response.json();
        let sortedModels = data.sort((a, b) => a.id.localeCompare(b.id));
        setModels(sortedModels.map(model => model.id));
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const response = await fetch('https://api.llm7.io/stats/days');
        const data = await response.json();
        if (data && Array.isArray(data.stats)) {
            setStatsData(data.stats);
            let total = 0;
            data.stats.forEach(item => {
              total += item.requests_num;
            });
            setTotalRequests(total);
        } else {
            console.error('Unexpected stats data format:', data);
            setStatsData([]);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
         setStatsData([]);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
  <Router>
      <Routes>
        <Route path="/redirect/kofi" element={<RedirectKofi />} />
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

            {/* --- Statistics Chart Section --- */}
            <h2 className="text-xl font-semibold mt-6 mb-2">Usage Statistics</h2>
            <div className="w-full max-w-4xl mx-4 mb-6"> {/* Container for chart and preloader */}
              {isLoadingStats ? (
                <div className="text-center p-10 text-gray-500">Loading chart data...</div> // Simple preloader
              ) : (
                statsData.length > 0 ? ( // Only render chart if data exists
                   <>
                    <StatsChart data={statsData} />
                    <div>Total requests: {totalRequests}</div>
                    </>
                ) : (
                   <div className="text-center p-10 text-gray-500">Could not load statistics.</div>
                )
              )}
            </div>
            {/* --- End Statistics Chart Section --- */}

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

      <div className="mt-8 px-4 max-w-2xl text-gray-700 text-sm text-center">
                <p>
                  LLM7.io is provided free of charge, made possible by donations. The primary aim is
                  to ensure open access to powerful models for everyone, worldwide. We cannot
                  guarantee 100% uptime or availability of specific models, and we may switch or
                  change models at any time. Use this service at your own risk: no warranties, and
                  any liabilities rest solely with you. Anonymous user data may be analyzed for
                  research to help us improve future models.
                </p>
                <p className="mt-2">
                  For more details, please see our{' '}
                  <a
                    href="https://github.com/chigwell/llm7.io/blob/main/TERMS.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Terms
                  </a>.
                </p>
              </div>

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