import React, { useRef } from "react";
import { SpeechInputMonitor } from "./SpeechInputMonitor";

/**
 * Demonstrates the SpeechInputMonitor with automatic word generation.
 * Words are added every 200ms to show line wrapping and fade animations.
 */
export const Default: React.FC = () => {
  const receiverRef = useRef<((word: string) => void) | null>(null);
  
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
        <SpeechInputMonitor receiverRef={receiverRef} showTextInput={true} />
      </div>
    </div>
  );
}; 