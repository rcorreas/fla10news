'use client';

import { useEffect, useRef } from 'react';

interface AdsKeeperWidgetProps {
  widgetId: string;
  className?: string;
}

export function AdsKeeperWidget({ widgetId, className = "flex justify-center my-6" }: AdsKeeperWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent duplicate script injections
    if (containerRef.current && !containerRef.current.hasAttribute('data-adskeeper-loaded')) {
      const script = document.createElement('script');
      script.text = `(function(w,q){w[q]=w[q]||[];w[q].push(["_mgc.load"])})(window,"_mgq");`;
      containerRef.current.appendChild(script);
      containerRef.current.setAttribute('data-adskeeper-loaded', 'true');
    }
  }, []);

  return (
    <div className={className}>
      <div 
        ref={containerRef}
        data-type="_mgwidget" 
        data-widget-id={widgetId}
      ></div>
    </div>
  );
}
