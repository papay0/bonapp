'use client';

import { useEffect, useState, useRef } from 'react';

const RECIPE_TEXT = `# Spaghetti Carbonara

A classic Italian pasta dish with eggs, cheese, and pancetta.

## Ingredients
- 400g spaghetti
- 200g pancetta or guanciale, diced
- 4 large eggs
- 100g Pecorino Romano cheese, grated
- 100g Parmesan cheese, grated
- Black pepper to taste
- Salt for pasta water

## Instructions
1. Bring a large pot of salted water to boil. Cook spaghetti until al dente.
2. While pasta cooks, fry pancetta in a large pan until crispy.
3. In a bowl, whisk eggs with grated cheeses and black pepper.
4. Drain pasta, reserving 1 cup of pasta water.
5. Add hot pasta to pancetta pan, remove from heat.
6. Quickly stir in egg mixture, adding pasta water to create a creamy sauce.
7. Serve immediately with extra cheese and black pepper.`;

export function AIDemoAnimation() {
  const [typedInput, setTypedInput] = useState('');
  const [streamedOutput, setStreamedOutput] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const INPUT_TEXT = 'carbonara';

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    if (scrollContainerRef.current && isStreaming) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [streamedOutput, isStreaming]);

  useEffect(() => {
    // Reset animation
    const resetAnimation = () => {
      setTypedInput('');
      setStreamedOutput('');
      setIsTyping(true);
      setIsStreaming(false);
    };

    // Type the input
    if (isTyping && typedInput.length < INPUT_TEXT.length) {
      const timeout = setTimeout(() => {
        setTypedInput(INPUT_TEXT.slice(0, typedInput.length + 1));
      }, 150);
      return () => clearTimeout(timeout);
    } else if (isTyping && typedInput.length === INPUT_TEXT.length) {
      // Wait a bit before streaming
      const timeout = setTimeout(() => {
        setIsTyping(false);
        setIsStreaming(true);
      }, 500);
      return () => clearTimeout(timeout);
    }

    // Stream the output
    if (isStreaming && streamedOutput.length < RECIPE_TEXT.length) {
      const timeout = setTimeout(() => {
        setStreamedOutput(RECIPE_TEXT.slice(0, streamedOutput.length + 1));
      }, 10); // Fast streaming like ChatGPT
      return () => clearTimeout(timeout);
    } else if (isStreaming && streamedOutput.length === RECIPE_TEXT.length) {
      // Wait before restarting
      const timeout = setTimeout(() => {
        resetAnimation();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [typedInput, streamedOutput, isTyping, isStreaming]);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20">
      {/* Input Section */}
      <div className="mb-4">
        <div className="text-yellow-300 font-semibold text-sm mb-2">You type:</div>
        <div className="bg-white/20 rounded-lg px-4 py-3 backdrop-blur-sm font-mono text-sm min-h-[44px] flex items-center">
          {typedInput}
          {isTyping && (
            <span className="inline-block w-0.5 h-4 bg-white ml-1 animate-pulse" />
          )}
        </div>
      </div>

      {/* Output Section */}
      <div>
        <div className="text-yellow-300 font-semibold text-sm mb-2">AI generates:</div>
        <div
          ref={scrollContainerRef}
          className="bg-white/20 rounded-lg px-4 py-3 backdrop-blur-sm text-sm min-h-[200px] max-h-[300px] overflow-y-auto text-left scroll-smooth"
        >
          {isStreaming || streamedOutput ? (
            <div className="prose prose-invert prose-sm max-w-none">
              {streamedOutput.split('\n').map((line, i) => {
                // H1
                if (line.startsWith('# ')) {
                  return <h1 key={i} className="text-xl font-bold text-white mb-2 mt-0">{line.slice(2)}</h1>;
                }
                // H2
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="text-base font-bold text-white mt-3 mb-1.5">{line.slice(3)}</h2>;
                }
                // List items
                if (line.startsWith('- ')) {
                  return <li key={i} className="ml-4 text-white/90 list-disc">{line.slice(2)}</li>;
                }
                // Numbered list
                if (line.match(/^\d+\. /)) {
                  const content = line.replace(/^\d+\. /, '');
                  return <li key={i} className="ml-4 text-white/90 list-decimal">{content}</li>;
                }
                // Empty line
                if (line.trim() === '') {
                  return <div key={i} className="h-1.5"></div>;
                }
                // Regular paragraph
                return <p key={i} className="text-white/90 leading-relaxed my-1">{line}</p>;
              })}
              {isStreaming && streamedOutput.length < RECIPE_TEXT.length && (
                <span className="inline-block w-0.5 h-4 bg-white ml-0.5 animate-pulse align-middle" />
              )}
            </div>
          ) : (
            <div className="text-white/50 italic">Waiting for input...</div>
          )}
        </div>
      </div>
    </div>
  );
}
