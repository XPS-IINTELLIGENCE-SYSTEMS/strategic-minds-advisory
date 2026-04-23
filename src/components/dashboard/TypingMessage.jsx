import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function TypingMessage({ content, isComplete }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!content) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < content.length) {
        setDisplayedText(content.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 8);

    return () => clearInterval(interval);
  }, [content]);

  return (
    <div className="relative">
      <ReactMarkdown
        className="prose prose-sm prose-invert max-w-none text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:text-sm [&_ul]:text-sm [&_ol]:text-sm [&_li]:text-sm [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm"
      >
        {displayedText}
      </ReactMarkdown>
      {!isComplete && <span className="inline-block w-1.5 h-4 ml-0.5 bg-accent animate-pulse" />}
    </div>
  );
}