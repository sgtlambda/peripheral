import React, { useRef, useEffect } from "react";
import { SpeechInputMonitor } from "./SpeechInputMonitor";

/**
 * Demonstrates the SpeechInputMonitor with automatic word generation.
 * Words are added every 200ms to show line wrapping and fade animations.
 */
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
      
      <div style={{ maxWidth: "600px" }}>
        <SpeechInputMonitor receiverRef={receiverRef} />
      </div>
    </div>
  );
}; 