'use client';

import React, { useEffect, useRef } from 'react';

export function SofascoreWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    containerRef.current.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.setAttribute('data-widget-type', 'entityStandings');
    widgetDiv.setAttribute('data-entity-type', 'league');
    widgetDiv.setAttribute('data-entity-id', '113');
    widgetDiv.setAttribute('data-lang', 'pt-br');
    widgetDiv.setAttribute('data-widget-id', '366ccc64-c56b-47d0-8d58-bbb9ea042210');
    containerRef.current.appendChild(widgetDiv);

    const brandingDiv = document.createElement('div');
    brandingDiv.className = "text-xs font-sans text-left mt-1 text-muted-foreground";
    brandingDiv.innerHTML = 'Desenvolvido por <a href="https://www.365scores.com/pt-br" target="_blank" rel="noopener noreferrer" class="underline text-primary ml-1">365Scores.com</a>';
    containerRef.current.appendChild(brandingDiv);

    const script = document.createElement('script');
    script.src = "https://widgets.365scores.com/main.js";
    script.async = true;
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[768px]">
      <div ref={containerRef} />
    </div>
  );
}
