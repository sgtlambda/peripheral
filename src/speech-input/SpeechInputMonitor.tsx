import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechInputLine } from './SpeechInputLine';

type LineData = {
  id: string;
  ref: React.MutableRefObject<((word: string) => boolean) | null>;
  isRemoving: boolean;
};

export const SpeechInputMonitor: React.FC<{
  receiverRef: React.MutableRefObject<((word: string) => void) | null>;
}> = ({ receiverRef }) => {
  const [lines, setLines] = useState<LineData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const addWord = useCallback((word: string) => {
    setLines(prevLines => {
      if (prevLines.length === 0) {
        // First word, create first line
        const lineRef = { current: null } as React.MutableRefObject<((word: string) => boolean) | null>;
        const newLine: LineData = {
          id: `line-${Date.now()}`,
          ref: lineRef,
          isRemoving: false,
        };
        
        // Add word after line is created
        setTimeout(() => {
          if (lineRef.current) {
            lineRef.current(word);
          }
        }, 0);
        
        return [newLine];
      }
      
      const lastLine = prevLines[prevLines.length - 1];
      
      // Try to add word to the last line
      if (lastLine.ref.current && !lastLine.isRemoving) {
        const accepted = lastLine.ref.current(word);
        
        if (accepted) {
          return prevLines; // Word was accepted, no change to lines
        }
      }
      
      // Word was rejected or no line available, create new line
      const lineRef = { current: null } as React.MutableRefObject<((word: string) => boolean) | null>;
      const newLine: LineData = {
        id: `line-${Date.now()}`,
        ref: lineRef,
        isRemoving: false,
      };
      
      // Add word after line is created
      setTimeout(() => {
        if (lineRef.current) {
          lineRef.current(word);
        }
      }, 0);
      
      return [...prevLines, newLine];
    });
  }, []);
  
  // Set the receiver function
  useEffect(() => {
    receiverRef.current = addWord;
  }, [addWord, receiverRef]);
  
  const handleLineFaded = useCallback((lineId: string) => {
    setLines(prevLines => 
      prevLines.map(line => 
        line.id === lineId 
          ? { ...line, isRemoving: true }
          : line
      )
    );
  }, []);
  
  // Remove lines after animation completes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLines(prevLines => 
        prevLines.filter(line => !line.isRemoving)
      );
    }, 300); // Match animation duration
    
    return () => clearTimeout(timeout);
  }, [lines]);
  
  return (
    <div 
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '60px',
        padding: '20px',
        fontFamily: 'sans-serif',
        fontSize: '18px',
        lineHeight: '1.4',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}
    >
      {lines.map(line => (
        <div
          key={line.id}
          style={{
            transition: line.isRemoving ? 'height 0.3s ease-out, margin 0.3s ease-out, opacity 0.3s ease-out' : 'none',
            height: line.isRemoving ? '0px' : 'auto',
            marginBottom: line.isRemoving ? '0px' : '8px',
            opacity: line.isRemoving ? 0 : 1,
            overflow: 'hidden',
          }}
        >
          <SpeechInputLine
            addWordRef={line.ref}
            onAllWordsFaded={() => handleLineFaded(line.id)}
            maxWidth={containerRef.current ? containerRef.current.offsetWidth - 40 : undefined}
          />
        </div>
      ))}
      
      {lines.length === 0 && (
        <div style={{ 
          color: 'rgba(255, 255, 255, 0.7)', 
          fontStyle: 'italic',
          textAlign: 'center',
        }}>
          Listening for speech...
        </div>
      )}
    </div>
  );
}; 