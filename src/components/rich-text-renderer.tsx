"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface RichTextRendererProps {
  content: string;
  adSlot?: React.ReactNode;
}

export function RichTextRenderer({ content, adSlot }: RichTextRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adContainer, setAdContainer] = useState<HTMLElement | null>(null);

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

    if (adSlot) {
      const children = Array.from(containerRef.current.children);
      // Try to find root-level paragraphs to insert the ad nicely in the middle
      const paragraphs = children.filter((el) => el.tagName.toLowerCase() === "p");
      
      if (paragraphs.length > 0) {
        // Only insert if we haven't already created the container
        if (!adContainer) {
            const middleIndex = Math.floor(paragraphs.length / 2);
            const targetParagraph = paragraphs[middleIndex];
            
            const newAdDiv = document.createElement("div");
            targetParagraph.parentNode?.insertBefore(newAdDiv, targetParagraph.nextSibling);
            setAdContainer(newAdDiv);
        }
      } else if (children.length > 0 && !adContainer) {
        // Fallback: if no paragraphs, insert after the middle root element
        const middleIndex = Math.floor(children.length / 2);
        const targetElement = children[middleIndex];
        const newAdDiv = document.createElement("div");
        targetElement.parentNode?.insertBefore(newAdDiv, targetElement.nextSibling);
        setAdContainer(newAdDiv);
      }
    }
  }, [content, adSlot, adContainer]);

  return (
    <>
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: content }} />
      {adContainer && adSlot && createPortal(adSlot, adContainer)}
    </>
  );
}
