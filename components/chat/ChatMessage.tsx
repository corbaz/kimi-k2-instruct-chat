import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Bot } from "lucide-react";
import { Message } from "@/lib/database";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <Card className={`p-3 ${
          isUser 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted'
        }`}>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex, rehypeSanitize]}
                components={{
                  code: ({ className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    const isInline = !className;
                    
                    if (isInline) {
                      return (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground border" {...props}>
                          {children}
                        </code>
                      );
                    }
                    
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }: any) => {
                    const codeElement = children?.props;
                    const className = codeElement?.className || '';
                    const match = /language-(\w+)/.exec(className);
                    const language = match ? match[1] : '';
                    const code = codeElement?.children || '';
                    
                    const copyToClipboard = () => {
                      if (typeof code === 'string') {
                        navigator.clipboard.writeText(code);
                      }
                    };
                    
                    return (
                      <div className="relative group my-4">
                        {language && (
                          <div className="flex items-center justify-between bg-muted border border-b-0 px-4 py-2 rounded-t-lg">
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                              {language}
                            </span>
                            <button
                              onClick={copyToClipboard}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-background hover:bg-accent px-2 py-1 rounded border"
                              title="Copy code"
                            >
                              Copy
                            </button>
                          </div>
                        )}
                        <pre className={`bg-muted p-4 overflow-x-auto font-mono text-sm border ${
                          language ? 'rounded-b-lg' : 'rounded-lg'
                        }`}>
                          {children}
                        </pre>
                      </div>
                    );
                  },
                  p: ({ children }: any) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                  h1: ({ children }: any) => (
                    <h1 className="text-xl font-bold mb-2">{children}</h1>
                  ),
                  h2: ({ children }: any) => (
                    <h2 className="text-lg font-semibold mb-2">{children}</h2>
                  ),
                  h3: ({ children }: any) => (
                    <h3 className="text-base font-medium mb-2">{children}</h3>
                  ),
                  ul: ({ children }: any) => (
                    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }: any) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                  ),
                  blockquote: ({ children }: any) => (
                    <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-2">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }: any) => (
                    <div className="overflow-x-auto my-2">
                      <table className="min-w-full border-collapse border border-muted">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }: any) => (
                    <thead className="bg-muted">{children}</thead>
                  ),
                  tbody: ({ children }: any) => (
                    <tbody>{children}</tbody>
                  ),
                  tr: ({ children }: any) => (
                    <tr className="border-b border-muted">{children}</tr>
                  ),
                  th: ({ children }: any) => (
                    <th className="border border-muted px-3 py-2 text-left font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }: any) => (
                    <td className="border border-muted px-3 py-2">{children}</td>
                  ),
                  input: ({ checked, type, ...props }: any) => {
                    if (type === 'checkbox') {
                      return (
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled
                          className="mr-2"
                          {...props}
                        />
                      );
                    }
                    return <input type={type} {...props} />;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </Card>
        
        <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <Badge variant="outline" className="text-xs">
            {isUser ? 'You' : 'Assistant'}
          </Badge>
          <span>
            {new Date(message.created_at).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
      
      {isUser && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}