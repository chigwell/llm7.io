import React, { useState, useCallback } from 'react';
import { ChatLLM7 } from "langchain-llm7";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const chat = new ChatLLM7({
  stream: true,
});

function LiveExample() {
  const [prompt, setPrompt] = useState("Tell me a short story about a brave squirrel.");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse("");

    const messages = [
      new SystemMessage("You are a helpful AI assistant."),
      new HumanMessage(prompt),
    ];

    try {
      const stream = await chat.stream(messages);
      // No need for the separate streamedResponse variable
      // let streamedResponse = "";
      for await (const chunk of stream) {
      console.log(chunk.text)
        // Use the functional update form to append the new chunk text
        setResponse(prevResponse => prevResponse + chunk.text);
        // streamedResponse += chunk.text; // Remove this line
        // setResponse(streamedResponse); // Remove this line
      }
    } catch (err) {
      console.error("Streaming Error:", err);
      setError(`Error interacting with LLM: ${err.message}. Note: Direct browser calls often fail due to CORS or runtime limitations. A backend proxy is usually required.`);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-4xl mx-4 border border-gray-200">
      <form onSubmit={handleSubmit}>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
          Enter your prompt:
        </label>
        <textarea
          id="prompt"
          rows="3"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., What is LangChain?"
          disabled={isLoading}
        />
        <button
          type="submit"
          style={{ backgroundColor: isLoading ? '#ccc' : 'rgb(31 41 55 / var(--tw-bg-opacity))' }}
          disabled={isLoading || !prompt}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isLoading ? 'Generating...' : 'Send Prompt'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          <p><strong>Error:</strong></p>
          <p>{error}</p>
        </div>
      )}

      {response && !error && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Response:
          </label>
          <pre className="bg-gray-100 p-3 rounded-md whitespace-pre-wrap break-words text-sm border border-gray-200">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}

export default LiveExample;