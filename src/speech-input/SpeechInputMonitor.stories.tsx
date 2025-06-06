import React, { useRef, useEffect } from "react";
import { SpeechInputMonitor } from "./SpeechInputMonitor";

export const Default: React.FC = () => {
  const receiverRef = useRef<((word: string) => void) | null>(null);
  
  // Sample words to simulate speech input
  const sampleWords = [
    "Hello", "world", "this", "is", "a", "test", "of", "the", "speech", "input", 
    "monitor", "component", "that", "shows", "words", "appearing", "and", "fading",
    "as", "they", "come", "in", "from", "speech", "recognition", "system", "with",
    "automatic", "line", "wrapping", "when", "text", "becomes", "too", "long", "for",
    "the", "current", "line", "and", "smooth", "animations", "throughout", "the",
    "entire", "process", "of", "displaying", "and", "removing", "content"
  ];
  
  useEffect(() => {
    let wordIndex = 0;
    
    const interval = setInterval(() => {
      if (receiverRef.current && wordIndex < sampleWords.length) {
        receiverRef.current(sampleWords[wordIndex]);
        wordIndex = (wordIndex + 1) % sampleWords.length;
      }
    }, 200); // Add a new word every 200ms
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{ 
      padding: "20px", 
      fontFamily: "sans-serif",
      background: "#f5f5f5",
      minHeight: "100vh"
    }}>
      <h3 style={{ marginBottom: "20px", color: "#333" }}>
        Speech Input Monitor Demo
      </h3>
      
      <p style={{ 
        marginBottom: "20px", 
        color: "#666",
        maxWidth: "600px",
        lineHeight: "1.5"
      }}>
        This component automatically adds a new word every 200ms. Watch how words appear, 
        fade out after 2 seconds, and lines collapse when empty. The component handles 
        line wrapping automatically based on container width.
      </p>
      
      <div style={{ maxWidth: "600px" }}>
        <SpeechInputMonitor receiverRef={receiverRef} />
      </div>
      
      <div style={{ 
        marginTop: "30px", 
        padding: "15px", 
        background: "white", 
        borderRadius: "8px",
        maxWidth: "600px"
      }}>
        <h4 style={{ marginTop: "0", color: "#333" }}>Features:</h4>
        <ul style={{ color: "#666", lineHeight: "1.6" }}>
          <li>Words appear with smooth opacity transitions</li>
          <li>Automatic line wrapping when text becomes too wide</li>
          <li>Words fade out after 2 seconds</li>
          <li>Empty lines collapse with height animation</li>
          <li>Beautiful gradient background with modern styling</li>
          <li>Responsive design that adapts to container width</li>
        </ul>
      </div>
    </div>
  );
}; 