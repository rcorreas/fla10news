'use client';

import React from 'react';
import Script from 'next/script';

export function SofascoreWidget() {
  return (
    <div className="mx-auto w-full max-w-[768px]">
      <div 
        data-widget-type="entityStandings" 
        data-entity-type="league" 
        data-entity-id="113" 
        data-lang="pt-br" 
        data-widget-id="366ccc64-c56b-47d0-8d58-bbb9ea042210"
      ></div>
      <div className="text-xs font-sans text-left mt-1 text-muted-foreground">
        Desenvolvido por
        <a href="https://www.365scores.com/pt-br" target="_blank" rel="noopener noreferrer" className="underline text-primary ml-1">
          365Scores.com
        </a>
      </div>
      <Script 
        id="365scores-widget" 
        src="https://widgets.365scores.com/main.js" 
        strategy="lazyOnload" 
        crossOrigin="anonymous"
      />
    </div>
  );
}
