'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
        themeVariables: {
          primaryColor: '#3b82f6',
          primaryTextColor: '#ffffff',
          primaryBorderColor: '#1e40af',
          lineColor: '#6b7280',
          sectionBkgColor: '#374151',
          altSectionBkgColor: '#4b5563',
          gridColor: '#6b7280',
          secondaryColor: '#10b981',
          tertiaryColor: '#f59e0b',
          background: '#1f2937',
          mainBkg: '#374151',
          secondBkg: '#4b5563',
          tertiaryBkg: '#6b7280',
        }
      });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (ref.current && isInitialized && chart) {
      const renderDiagram = async () => {
        try {
          // Clear previous content
          ref.current!.innerHTML = '';
          
          // Generate unique ID for this diagram
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          
          // Render the diagram
          const { svg } = await mermaid.render(id, chart);
          
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          if (ref.current) {
            ref.current.innerHTML = `
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                <p class="font-medium">Mermaid Diagram Error</p>
                <p class="text-sm mt-1">Failed to render diagram. Please check the syntax.</p>
                <pre class="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">${chart}</pre>
              </div>
            `;
          }
        }
      };

      renderDiagram();
    }
  }, [chart, isInitialized]);

  return (
    <div className="my-4 p-4 bg-muted rounded-lg overflow-x-auto">
      <div ref={ref} className="flex justify-center items-center min-h-[100px]">
        {!isInitialized && (
          <div className="text-muted-foreground text-sm">Loading diagram...</div>
        )}
      </div>
    </div>
  );
}