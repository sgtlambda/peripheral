import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechInputLine } from './SpeechInputLine';

type LineData = {
  id: string;
  ref: React.MutableRefObject<((word: string) => boolean) | null>;
  replaceRef: React.MutableRefObject<((word: string) => boolean) | null>;
  commitRef?: React.MutableRefObject<(() => void) | null>;
  isRemoving: boolean;
  hasTemporaryWord: boolean;
};

/**
 * A multi-line speech input monitor that displays incoming words with automatic line wrapping.
 * 
 * Words are added to the current line until it's full, then new lines are created automatically.
 * Each line uses SpeechInputLine components for word management and fade animations.
 * Lines collapse and are removed when all their words have faded out.
 * 
 * @example
 * ```tsx
 * const receiverRef = useRef<((word: string) => void) | null>(null);
 * 
 * <SpeechInputMonitor receiverRef={receiverRef} />
 * 
 * // Later, from speech recognition
 * receiverRef.current?.('hello');
 * receiverRef.current?.('world');
 * ```
 */
export const SpeechInputMonitor: React.FC<{
  /** Ref that will be set to the word receiver function for adding new words */
  receiverRef: React.MutableRefObject<((word: string) => void) | null>;
  /** Show text input for testing live typing */
  showTextInput?: boolean;
}> = ({ receiverRef, showTextInput = false }) => {
  const [lines, setLines] = useState<LineData[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const addWord = useCallback((word: string) => {
    setLines(prevLines => {
      if (prevLines.length === 0) {
        // First word, create first line
        const lineRef = { current: null } as React.MutableRefObject<((word: string) => boolean) | null>;
        const replaceRef = { current: null } as React.MutableRefObject<((word: string) => boolean) | null>;
        const commitRef = { current: null } as React.MutableRefObject<(() => void) | null>;
        const newLine: LineData = {
          id: `line-${Date.now()}`,
          ref: lineRef,
          replaceRef: replaceRef,
          commitRef: commitRef,
          isRemoving: false,
          hasTemporaryWord: false,
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
      const replaceRef = { current: null } as React.MutableRefObject<((word: string) => boolean) | null>;
      const commitRef = { current: null } as React.MutableRefObject<(() => void) | null>;
      const newLine: LineData = {
        id: `line-${Date.now()}`,
        ref: lineRef,
        replaceRef: replaceRef,
        commitRef: commitRef,
        isRemoving: false,
        hasTemporaryWord: false,
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

  const updateCurrentWord = useCallback((word: string) => {
    if (!word.trim()) return;
    
    setLines(prevLines => {
      // Find the line with a temporary word
      let targetLineIndex = prevLines.findIndex(line => line.hasTemporaryWord);
      
      if (targetLineIndex !== -1) {
        // Update existing temporary word
        const targetLine = prevLines[targetLineIndex];
        if (targetLine.replaceRef.current) {
          targetLine.replaceRef.current(word);
        }
        return prevLines;
      }
      
      // No temporary word exists, try to add to the last line
      if (prevLines.length === 0) {
        // No lines exist, create one
        const lineRef = { current: null } as React.MutableRefObject<((word: string) => boolean) | null>;
        const replaceRef = { current: null } as React.MutableRefObject<((word: string) => boolean) | null>;
        const commitRef = { current: null } as React.MutableRefObject<(() => void) | null>;
        const newLine: LineData = {
          id: `line-${Date.now()}`,
          ref: lineRef,
          replaceRef: replaceRef,
          commitRef: commitRef,
          isRemoving: false,
          hasTemporaryWord: true,
        };
        
        setTimeout(() => {
          if (replaceRef.current) {
            replaceRef.current(word);
          }
        }, 0);
        
        return [newLine];
      }
      
      // Try to add to the last line
      const lastLineIndex = prevLines.length - 1;
      const lastLine = prevLines[lastLineIndex];
      
      if (lastLine.replaceRef.current) {
        const accepted = lastLine.replaceRef.current(word);
        
        if (accepted) {
          // Word was accepted, mark line as having temporary word
          const updatedLines = [...prevLines];
          updatedLines[lastLineIndex] = { ...lastLine, hasTemporaryWord: true };
          return updatedLines;
        } else {
          // Word was rejected, create new line
          const lineRef = { current: null } as React.MutableRefObject<((word: string) => boolean) | null>;
          const replaceRef = { current: null } as React.MutableRefObject<((word: string) => boolean) | null>;
          const commitRef = { current: null } as React.MutableRefObject<(() => void) | null>;
          const newLine: LineData = {
            id: `line-${Date.now()}`,
            ref: lineRef,
            replaceRef: replaceRef,
            commitRef: commitRef,
            isRemoving: false,
            hasTemporaryWord: true,
          };
          
          setTimeout(() => {
            if (replaceRef.current) {
              replaceRef.current(word);
            }
          }, 0);
          
          return [...prevLines, newLine];
        }
      }
      
      return prevLines;
    });
  }, []);

  const commitCurrentWord = useCallback(() => {
    // Just commit temporary words, don't add duplicates
    setLines(prevLines => 
      prevLines.map(line => {
        if (line.hasTemporaryWord && line.commitRef?.current) {
          line.commitRef.current();
        }
        return { ...line, hasTemporaryWord: false };
      })
    );
    
    setCurrentInput('');
  }, [currentInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInput(value);
    
    if (value.endsWith(' ')) {
      // Space pressed, commit the words
      commitCurrentWord();
    } else {
      // Update current word being typed
      const words = value.trim().split(' ');
      const currentWord = words[words.length - 1];
      
      if (currentWord) {
        updateCurrentWord(currentWord);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitCurrentWord();
    }
  };
  
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
            replaceLatestWordRef={line.replaceRef}
            commitLatestWordRef={line.commitRef}
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
          {showTextInput ? 'Type in the input below...' : 'Listening for speech...'}
        </div>
      )}
      
      {showTextInput && (
        <div style={{ marginTop: '10px' }}>
          <input
            type="text"
            value={currentInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type here... Press space to commit words"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}; 