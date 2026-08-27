"use client";

import { useEffect, useRef } from "react";

interface RichTextRendererProps {
  content: string;
}

export function RichTextRenderer({ content }: RichTextRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scripts = containerRef.current.querySelectorAll("script");
    
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [content]);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: content }} />;
}
