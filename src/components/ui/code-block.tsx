"use client";

import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";

// For type safety, we need to declare the module types
declare module 'react-syntax-highlighter';
declare module 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language: string;
  fileName?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language,
  fileName,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden">
      {fileName && (
        <div className="flex justify-between items-center bg-zinc-800 px-4 py-2 text-sm text-zinc-300 border-b border-zinc-700">
          <span>{fileName}</span>
        </div>
      )}
      
      <div className="relative">
        <button
          onClick={copyToClipboard}
          className="absolute right-2 top-2 p-2 rounded-md bg-zinc-700/50 hover:bg-zinc-700 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-zinc-300" />
          )}
        </button>
        
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.875rem",
            borderRadius: fileName ? "0 0 0.5rem 0.5rem" : "0.5rem",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
} 