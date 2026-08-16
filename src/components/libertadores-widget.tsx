'use client';

import React from 'react';

export function LibertadoresWidget() {
  return (
    <div className="mx-auto w-full flex flex-col items-center justify-center">
      <iframe 
        id="sofa-cupTree-embed-384-87760-10859525" 
        src="https://widgets.sofascore.com/embed/unique-tournament/384/season/87760/cuptree/10859525?widgetTitle=CONMEBOL Libertadores 2026, Knockout stage&showCompetitionLogo=true&widgetTheme=light" 
        style={{ height: '872px', maxWidth: '700px', width: '100%' }} 
        frameBorder="0" 
        scrolling="yes"
      />
      <div style={{ fontSize: '12px', fontFamily: 'Arial,sans-serif', textAlign: 'left', marginTop: '8px', maxWidth: '700px', width: '100%' }}>
        Cup tree provided by <a target="_blank" rel="noopener noreferrer" href="https://www.sofascore.com/football/tournament/south-america/conmebol-libertadores/384#id:87760" className="text-blue-600 hover:underline">Sofascore</a>
      </div>
    </div>
  );
}
