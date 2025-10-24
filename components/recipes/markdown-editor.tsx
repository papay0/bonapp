'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Edit3 } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="w-full">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('edit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            mode === 'edit'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Edit3 className="h-4 w-4" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMode('preview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            mode === 'preview'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>

      {/* Editor/Preview Area */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {mode === 'edit' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Write your recipe in Markdown...'}
            className="w-full min-h-[400px] p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        ) : (
          <div className="min-h-[400px] p-4 bg-gray-50">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                h4: ({node, ...props}) => <h4 className="text-lg font-bold mt-3 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="mb-4 text-gray-700" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                li: ({node, ...props}) => <li className="ml-4" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                em: ({node, ...props}) => <em className="italic" {...props} />,
                code: ({node, inline, ...props}: any) =>
                  inline
                    ? <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                    : <code className="block bg-gray-200 p-4 rounded-lg text-sm font-mono overflow-x-auto my-4" {...props} />,
                a: ({node, ...props}) => <a className="text-emerald-600 hover:text-emerald-700 underline" {...props} />,
              }}
            >
              {value || '*No content to preview*'}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {mode === 'edit' && (
        <div className="mt-2 text-xs text-gray-500">
          <p>Markdown is supported. Use # for headings, ** for bold, * for italic, - for lists, etc.</p>
        </div>
      )}
    </div>
  );
}
