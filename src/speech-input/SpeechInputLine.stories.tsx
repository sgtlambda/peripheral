import React, { useRef, useEffect, useState } from "react";
import { Story } from "@ladle/react";
import { SpeechInputLine } from "./SpeechInputLine";

export const Default: Story<{
  width: number;
}> = ({ width }) => {
  const addWordRef = useRef<((word: string) => boolean) | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  // Sample words to test line overflow
  const sampleWords = [
    "Hello", "world", "this", "is", "a", "very", "long", "sentence", "that", "should",
    "eventually", "overflow", "the", "line", "width", "and", "cause", "rejection",
    "when", "adding", "more", "words", "to", "test", "the", "overflow", "detection"
  ];
  
  const addLogEntry = (message: string) => {
    setLog(prev => [...prev.slice(-9), message]); // Keep last 10 entries
  };
  
  const tryAddWord = () => {
    if (addWordRef.current && wordIndex < sampleWords.length) {
      const word = sampleWords[wordIndex];
      const accepted = addWordRef.current(word);
      addLogEntry(`"${word}": ${accepted ? 'ACCEPTED' : 'REJECTED'}`);
      setWordIndex(prev => prev + 1);
      
      if (!accepted) {
        setIsRunning(false);
        addLogEntry("Line is full - stopping");
      }
    }
  };
  
  const handleLineFaded = () => {
    addLogEntry("All words faded - line ready for removal");
  };
  
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      tryAddWord();
    }, 300);
    
    return () => clearInterval(interval);
  }, [isRunning, wordIndex]);
  
  const startAutoAdd = () => {
    setIsRunning(true);
    setWordIndex(0);
    setLog([]);
  };
  
  const stopAutoAdd = () => {
    setIsRunning(false);
  };
  
  const reset = () => {
    setIsRunning(false);
    setWordIndex(0);
    setLog([]);
    // Reset the line by creating a new key
    window.location.reload();
  };
  
  return (
    <div style={{ 
      padding: "20px", 
      fontFamily: "sans-serif",
      background: "#f5f5f5",
      minHeight: "100vh"
    }}>
      <h3 style={{ marginBottom: "20px", color: "#333" }}>
        Speech Input Line Component Test
      </h3>
      
      <p style={{ 
        marginBottom: "20px", 
        color: "#666",
        maxWidth: "600px",
        lineHeight: "1.5"
      }}>
        This tests the individual line component. It will automatically add words until 
        the line rejects a word (returns false), indicating it's full. Watch the log 
        to see when words are accepted or rejected.
      </p>
      
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white',
        padding: '20px',
        marginBottom: '20px',
        width: `${width}px`,
        fontSize: '18px',
        fontFamily: 'sans-serif',
        position: 'relative'
      }}>
        <SpeechInputLine 
          addWordRef={addWordRef} 
          onAllWordsFaded={handleLineFaded}
          maxWidth={width - 40} // Container width minus padding
        />
      </div>
      
      <div style={{ marginBottom: "20px" }}>
        <button 
          onClick={startAutoAdd}
          disabled={isRunning}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            background: isRunning ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isRunning ? "not-allowed" : "pointer"
          }}
        >
          {isRunning ? "Running..." : "Start Auto-Add"}
        </button>
        
        <button 
          onClick={stopAutoAdd}
          disabled={!isRunning}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            background: !isRunning ? "#ccc" : "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: !isRunning ? "not-allowed" : "pointer"
          }}
        >
          Stop
        </button>
        
        <button 
          onClick={() => tryAddWord()}
          disabled={isRunning || wordIndex >= sampleWords.length}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            background: (isRunning || wordIndex >= sampleWords.length) ? "#ccc" : "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: (isRunning || wordIndex >= sampleWords.length) ? "not-allowed" : "pointer"
          }}
        >
          Add Single Word
        </button>
        
        <button 
          onClick={reset}
          style={{
            padding: "10px 20px",
            background: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Reset
        </button>
      </div>
      
      <div style={{ 
        background: "white", 
        borderRadius: "8px",
        padding: "15px",
        maxWidth: "600px"
      }}>
        <h4 style={{ marginTop: "0", color: "#333", marginBottom: "10px" }}>
          Activity Log:
        </h4>
        <div style={{
          background: "#f8f8f8",
          padding: "10px",
          borderRadius: "4px",
          fontFamily: "monospace",
          fontSize: "14px",
          maxHeight: "200px",
          overflowY: "auto"
        }}>
          {log.length === 0 ? (
            <div style={{ color: "#999" }}>No activity yet...</div>
          ) : (
            log.map((entry, index) => (
              <div key={index} style={{ marginBottom: "2px" }}>
                {entry}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div style={{ 
        marginTop: "20px", 
        padding: "15px", 
        background: "white", 
        borderRadius: "8px",
        maxWidth: "600px"
      }}>
        <h4 style={{ marginTop: "0", color: "#333" }}>Test Features:</h4>
        <ul style={{ color: "#666", lineHeight: "1.6" }}>
          <li><strong>Overflow Detection:</strong> Words are rejected when line is full</li>
          <li><strong>Word Fading:</strong> Words fade out after 1.5-2 seconds</li>
          <li><strong>Line Callback:</strong> Notifies when all words are faded</li>
          <li><strong>Manual Control:</strong> Add words individually or automatically</li>
          <li><strong>Visual Feedback:</strong> See accepted/rejected status in real-time</li>
        </ul>
      </div>
    </div>
  );
};

Default.args = {
  width: 500,
}; 