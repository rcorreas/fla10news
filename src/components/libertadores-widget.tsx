'use client';

import React, { useEffect } from 'react';

export function LibertadoresWidget() {
  useEffect(() => {
    // Para garantir o carregamento do script em renderizações subsequentes (SPA navigation),
    // removemos a tag antiga caso ela exista e reinjetamos.
    const oldScript = document.getElementById('scoreaxis-script');
    if (oldScript) {
      oldScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'scoreaxis-script';
    script.src = "https://widgets.scoreaxis.com/api/football/league-table/623225b0a2303b43bc269144?widgetId=6xq3mpwxe726&lang=en&teamLogo=1&tableLines=0&homeAway=1&header=1&position=1&goals=1&gamesCount=1&diff=1&winCount=1&drawCount=1&loseCount=1&lastGames=1&points=1&teamsLimit=all&links=1&font=heebo&fontSize=14&rowDensity=100&widgetWidth=auto&widgetHeight=auto&bodyColor=%23ffffff&textColor=%23141416&linkColor=%23141416&borderColor=%23ecf1f7&tabColor=%23f3f8fd";
    script.async = true;
    
    document.body.appendChild(script);

    return () => {
      const currentScript = document.getElementById('scoreaxis-script');
      if (currentScript) {
        currentScript.remove();
      }
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[768px]">
      <div 
        id="widget-6xq3mpwxe726" 
        className="scoreaxis-widget w-full rounded-lg" 
        style={{
          width: 'auto',
          height: 'auto',
          fontSize: '14px',
          backgroundColor: '#ffffff',
          color: '#141416',
          border: '1px solid',
          borderColor: '#ecf1f7',
          overflow: 'auto'
        }}
      >
        <div className="widget-main-link text-xs" style={{ padding: '6px 12px', fontWeight: 500 }}>
          Dados ao vivo por <a href="https://www.scoreaxis.com/" style={{ color: 'inherit' }} className="underline">Scoreaxis</a>
        </div>
      </div>
    </div>
  );
}
