import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './SpeechInputLine.module.scss';

type WordItem = {
  id: string;
  text: string;
  timestamp: number;
};

export const SpeechInputLine: React.FC<{
  addWordRef: React.MutableRefObject<((word: string) => boolean) | null>;
  onAllWordsFaded?: () => void;
  maxWidth?: number;
}> = ({ addWordRef, onAllWordsFaded, maxWidth }) => {
  const [words, setWords] = useState<WordItem[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);
  const testRef = useRef<HTMLDivElement>(null);
  
  const addWord = useCallback((word: string): boolean => {
    if (!lineRef.current || !testRef.current) return false;
    
    // If this is the first word, always accept it
    if (words.length === 0) {
      const wordItem: WordItem = {
        id: `${Date.now()}-${Math.random()}`,
        text: word,
        timestamp: Date.now(),
      };
      setWords([wordItem]);
      return true;
    }
    
    // For subsequent words, test if adding them would cause wrapping
    // Create a temporary test element that mimics the exact structure
    const testContainer = document.createElement('div');
    testContainer.style.cssText = lineRef.current.style.cssText;
    testContainer.style.position = 'absolute';
    testContainer.style.visibility = 'hidden';
    testContainer.style.width = lineRef.current.offsetWidth + 'px';
    
    // Clone existing words
    words.forEach(w => {
      const span = document.createElement('span');
      span.textContent = w.text;
      span.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        margin-right: 6px;
        margin-bottom: 4px;
        display: inline-block;
        font-size: 18px;
        font-family: sans-serif;
      `;
      testContainer.appendChild(span);
    });
    
    // Get height with just existing words
    document.body.appendChild(testContainer);
    const heightWithExistingWords = testContainer.offsetHeight;
    
    // Add the new word
    const newWordSpan = document.createElement('span');
    newWordSpan.textContent = word;
    newWordSpan.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      margin-right: 6px;
      margin-bottom: 4px;
      display: inline-block;
      font-size: 18px;
      font-family: sans-serif;
    `;
    testContainer.appendChild(newWordSpan);
    
    // Get height with new word added
    const heightWithNewWord = testContainer.offsetHeight;
    document.body.removeChild(testContainer);
    
    // Check if height increased (indicating line wrap)
    if (heightWithNewWord > heightWithExistingWords) {
      return false; // Word doesn't fit
    }
    
    // Word fits, add it for real
    const wordItem: WordItem = {
      id: `${Date.now()}-${Math.random()}`,
      text: word,
      timestamp: Date.now(),
    };
    
    setWords(prevWords => [...prevWords, wordItem]);
    return true;
  }, [words]);
  
  // Set the addWord function on the ref
  useEffect(() => {
    addWordRef.current = addWord;
  }, [addWord, addWordRef]);
  
  // No need for manual fade timers - CSS keyframes handle this automatically
  
  // Check if all words are faded and notify parent
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const allWordsFaded = words.length > 0 && words.every(word => {
        const age = now - word.timestamp;
        return age >= 2000;
      });
      
      if (allWordsFaded && onAllWordsFaded) {
        onAllWordsFaded();
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [words, onAllWordsFaded]);
  
  return (
    <>
      {/* Hidden test element for measuring text width */}
      <div ref={testRef} className={styles.testElement} />
      
      <div ref={lineRef} className={styles.line}>
        {words.map((word) => (
          <span
            key={word.id}
            id={word.id}
            className={styles.speechWord}
          >
            {word.text}
          </span>
        ))}
        
        {words.length === 0 && (
          <span className={styles.emptyLine}>
            &nbsp;
          </span>
        )}
      </div>
    </>
  );
}; 