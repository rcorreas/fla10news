'use client';

import React, { useEffect, useRef } from 'react';

export function LibertadoresWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initialized.current) return;
    
    initialized.current = true;
    containerRef.current.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.id = "widget-6xq3mpwxe726";
    widgetDiv.className = "scoreaxis-widget w-full rounded-lg";
    widgetDiv.style.width = "auto";
    widgetDiv.style.height = "auto";
    widgetDiv.style.fontSize = "14px";
    widgetDiv.style.backgroundColor = "#ffffff";
    widgetDiv.style.color = "#141416";
    widgetDiv.style.border = "1px solid #ecf1f7";
    widgetDiv.style.overflow = "auto";

    const script = document.createElement('script');
    script.src = "https://widgets.scoreaxis.com/api/football/league-table/623225b0a2303b43bc269144?widgetId=6xq3mpwxe726&lang=en&teamLogo=1&tableLines=0&homeAway=1&header=1&position=1&goals=1&gamesCount=1&diff=1&winCount=1&drawCount=1&loseCount=1&lastGames=1&points=1&teamsLimit=all&links=1&font=heebo&fontSize=14&rowDensity=100&widgetWidth=auto&widgetHeight=auto&bodyColor=%23ffffff&textColor=%23141416&linkColor=%23141416&borderColor=%23ecf1f7&tabColor=%23f3f8fd";
    script.async = true;

    const linkDiv = document.createElement('div');
    linkDiv.className = "widget-main-link";
    linkDiv.style.padding = "6px 12px";
    linkDiv.style.fontWeight = "500";
    linkDiv.innerHTML = 'Live data by <a href="https://www.scoreaxis.com/" style="color: inherit;" target="_blank" rel="noopener noreferrer">Scoreaxis</a>';

    widgetDiv.appendChild(script);
    widgetDiv.appendChild(linkDiv);
    containerRef.current.appendChild(widgetDiv);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[768px] min-h-[400px] flex items-center justify-center">
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
