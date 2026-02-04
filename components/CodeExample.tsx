"use client";

import { useEffect, useMemo, useState } from 'react';
import { CodeIcon } from "lucide-react";
import { motion, TargetAndTransition } from "framer-motion";

export default function ConsoleAnimation() {
  const [lines, setLines] = useState<string[]>([]);
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');

  const commands = useMemo(() => [
    'import openai',
    '',
    'client = openai.OpenAI(',
    '    base_url="https://api.llm7.io/v1",',
    '    api_key="YOUR_FREE_TOKEN"  # Get it for free at https://token.llm7.io/',
    ')',
    '',
    'response = client.chat.completions.create(',
    '    model="default",  # You can also use "fast" or "pro" models',
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

    <>
      <div id="example" className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <motion.h3
              id="featured-heading"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight flex items-center justify-center gap-3"
            >
              <CodeIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Example Usage
              </span>
            </motion.h3>
        </div>
      </div>
    <div  className="relative group flex items-center justify-center py-6 sm:py-10">
      <pre style={{ minHeight: '320px', maxWidth: '768px' }}
          className="bg-gray-800 text-white p-2 md:p-4 rounded-lg shadow-md font-mono overflow-x-auto text-xs md:text-sm w-full max-w-4xl mx-4">
        {lines.join('\n')}
        {lines.length > 0 && '\n'}
        {currentText}
        <span className="animate-pulse">█</span>
      </pre>
    </div>
    </>
  );
}
