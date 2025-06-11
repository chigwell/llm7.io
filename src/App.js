import React, { useState, useEffect, useMemo } from 'react';
import LiveExample from './LiveExample';
import StatsChart from './StatsChart';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';



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
    '    model="gpt-4.1-nano",',
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
        <Route path="/" element={
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
      <img src="/logo.png" alt="LLM7 Logo" className="w-40 h-40 mt-8 mb-8" />

      <p className="text-center mb-6 text-gray-700 px-4">
        A free LLM provider.<br />
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
            <div className="w-full max-w-4xl mx-4 mb-6">
              {isLoadingStats ? (
                <div className="text-center p-10 text-gray-500">Loading chart data...</div>
              ) : (
                statsData.length > 0 ? (
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
        <div className="mt-8 px-4 max-w-4xl text-gray-700 text-sm text-center">
          <h3 className="text-base font-semibold mb-4">This service is made possible thanks to:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-center justify-center">
            <a
              href="https://azure.microsoft.com/en-us/products/ai-model-catalog"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2"
            >
              <div className="h-12 flex items-center justify-center">
                <img
                  src="https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Microsoft_Azure.svg/240px-Microsoft_Azure.svg.png&w=48&output=webp"
                  alt="Azure"
                />
              </div>
              <span>Azure</span>
            </a>
            <a
              href="https://ai.cloudflare.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2"
            >
              <div className="h-12 flex items-center justify-center">
                <img
                  src="https://wsrv.nl/?url=cdn.prod.website-files.com/6640cd28f51f13175e577c05/664e007b3edcb1f1cd6c7871_7a675b16-95cc-5699-bd72-d4ab79b979bf.svg&w=48&output=webp"
                  alt="Cloudflare AI"
                />
              </div>
              <span>Cloudflare</span>
            </a>
            <a
              href="https://platform.deepseek.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2"
            >
              <div className="h-12 flex items-center justify-center">
                <img
                  src="https://wsrv.nl/?url=registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/deepseek-color.png&w=48&output=webp"
                  alt="DeepSeek"
                />
              </div>
              <span>DeepSeek</span>
            </a>
            <a
              href="https://www.llama.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2"
            >
              <div className="h-12 flex items-center justify-center">
                <img
                  src="https://wsrv.nl/?url=ollama.com/public/ollama.png&w=48&output=webp&h=48"
                  alt="LLaMA / Ollama"
                />
              </div>
              <span>LLaMA / Ollama</span>
            </a>
            <a
              href="https://console.mistral.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2"
            >
              <div className="h-12 flex items-center justify-center">
                <img
                  src="https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Mistral_AI_logo_%282025%E2%80%93%29.svg/500px-Mistral_AI_logo_%282025%E2%80%93%29.svg.png&w=48&output=webp&h=48"
                  alt="Mistral"
                />
              </div>
              <span>Mistral</span>
            </a>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2"
            >
              <div className="h-12 flex items-center justify-center">
                <img
                  src="https://wsrv.nl/?url=upload.wikimedia.org/wikipedia/commons/thumb/6/66/OpenAI_logo_2025_%28symbol%29.svg/330px-OpenAI_logo_2025_%28symbol%29.svg.png&w=48&output=webp"
                  alt="OpenAI"
                />
              </div>
              <span>OpenAI</span>
            </a>
            <a
              href="https://github.com/pollinations/pollinations"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2"
            >
              <div className="h-12 flex items-center justify-center">
                <img
                  src="https://wsrv.nl/?url=avatars.githubusercontent.com/u/86964862&w=48&output=webp"
                  alt="Pollinations"
                />
              </div>
              <span>Pollinations</span>
            </a>
            <a
              href="https://www.scaleway.com/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-2"
            >
              <div className="h-12 flex items-center justify-center">
                <img
                  src="https://wsrv.nl/?url=avatars.githubusercontent.com/u/5185491&w=48&output=webp&h=48"
                  alt="Scaleway"
                />
              </div>
              <span>Scaleway</span>
            </a>
          </div>
        </div>
      <div className="mt-8 px-4 max-w-2xl text-gray-700 text-sm text-center">
                <p>
LLM7.io is offered free of charge thanks to the generosity of donors.
</p>
<p>
Important: Large language models can and do make mistakes—they may hallucinate, invent facts, or present outdated or incorrect information as if it were true. You must verify any critical output independently before relying on it.
</p>
<p>
The Service is provided “as is” and “as available,” with no warranties—express or implied—of any kind (including, without limitation, merchantability, fitness for a particular purpose, or non-infringement). We cannot guarantee uptime, availability of any particular model, or the accuracy, reliability, completeness, or usefulness of any content generated. We may modify, replace or withdraw models at any time without notice.
</p>
<p>
Use at your own risk. You assume full responsibility for all consequences arising from your use of the Service, including any decisions or actions taken in reliance on model outputs. LLM7.io and its contributors shall not be liable for any direct, indirect, incidental, special, consequential or punitive damages, losses or expenses arising from your access to or use of the Service (including but not limited to any damage to or loss of data, business interruption, or personal injury), even if advised of the possibility of such damages.
</p>
<p>
Anonymous usage data may be collected and analysed to improve future models; no personally identifying information is stored or used by LLM7.io.
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
            href="mailto:support@llm7.io"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-blue-600 hover:text-blue-800"
        >
            support@llm7.io
        </a>.
        <a
          href="https://www.linkedin.com/in/eugene-evstafev-716669181/"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-blue-600 hover:text-blue-800"
        >
          Created by Eugene Evstafev.
        </a>

      </footer>
    </div>
    } />
      </Routes>
    </Router>
  );
}

export default App;