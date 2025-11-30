'use client';

import ReactMarkdown from 'react-markdown';

type Props = {
  content: string;
  className?: string;
};

export function MarkdownRenderer({ content, className = '' }: Props) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
