import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './SpeechInputLine.module.scss';

type WordItem = {
  id: string;
  text: string;
  timestamp: number;
  isCommitted: boolean;
};

/**
 * A single line component for displaying speech input words with automatic overflow detection.
 * 
 * Words are displayed as styled pills that automatically fade out after 2 seconds using CSS keyframes.
 * When the line becomes full (rejects its first word), it starts fading out and notifies the parent for removal.
 * 
 * @example
 * ```tsx
 * const addWordRef = useRef<((word: string) => boolean) | null>(null);
 * 
 * <SpeechInputLine 
 *   addWordRef={addWordRef}
 *   onRemovalComplete={() => console.log('Line ready for removal')}
 *   maxWidth={400}
 * />
 * 
 * // Later, add a word
 * const accepted = addWordRef.current?.('hello');
 * ```
 */
export const SpeechInputLine: React.FC<{
  /** Ref that will be set to the addWord function. Returns true if word fits, false if rejected. */
  addWordRef: React.MutableRefObject<((word: string) => boolean) | null>;
  /** Ref that will be set to the replaceLatestWord function. Updates the last word if it's temporary. */
  replaceLatestWordRef?: React.MutableRefObject<((word: string) => boolean) | null>;
  /** Ref that will be set to the commitLatestWord function. Commits the latest temporary word. */
  commitLatestWordRef?: React.MutableRefObject<(() => void) | null>;
  /** Called when the line has completed its removal animation and should be removed from parent state */
  onRemovalComplete?: () => void;
  /** Maximum width constraint for overflow detection. If not provided, uses container width. */
  maxWidth?: number;
}> = ({ addWordRef, replaceLatestWordRef, commitLatestWordRef, onRemovalComplete, maxWidth }) => {
  const [words, setWords] = useState<WordItem[]>([]);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const lineRef = useRef<HTMLDivElement>(null);
  const testRef = useRef<HTMLDivElement>(null);
  
  const startFadeOut = useCallback(() => {
    console.log('🎬 SpeechInputLine: Starting fade out animation for line with words:', words.map(w => w.text));
    setIsFadingOut(true);
    
    // After fade animation completes, notify parent
    setTimeout(() => {
      console.log('✅ SpeechInputLine: Fade out animation COMPLETE, notifying parent for removal');
      onRemovalComplete?.();
    }, 800); // 0.8 seconds fade out time
  }, [onRemovalComplete, words]);
  
  const addWord = useCallback((word: string): boolean => {
    if (isFadingOut) return false; // Don't accept words if fading out
    if (!lineRef.current || !testRef.current) return false;
    
    // If this is the first word, always accept it
    if (words.length === 0) {
      const wordItem: WordItem = {
        id: `${Date.now()}-${Math.random()}`,
        text: word,
        timestamp: Date.now(),
        isCommitted: true,
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
    testContainer.style.height = 'auto'; // Override fixed height for testing
    testContainer.style.minHeight = '1.4em'; // Use min-height for natural sizing
    
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
      console.log(`🚫 SpeechInputLine: Word "${word}" rejected! Line is FULL with words:`, words.map(w => w.text));
      console.log('🎯 SpeechInputLine: Triggering fade out sequence...');
      startFadeOut();
      return false; // Word doesn't fit, line is full
    }
    
    // Word fits, add it for real
    const wordItem: WordItem = {
      id: `${Date.now()}-${Math.random()}`,
      text: word,
      timestamp: Date.now(),
      isCommitted: true,
    };
    
    setWords(prevWords => [...prevWords, wordItem]);
    return true;
  }, [words, isFadingOut, startFadeOut]);

  const replaceLatestWord = useCallback((word: string): boolean => {
    if (isFadingOut) return false; // Don't accept words if fading out
    if (!lineRef.current || !testRef.current) return false;
    
    setWords(prevWords => {
      if (prevWords.length === 0) {
        // No words to replace, add as temporary word
        const wordItem: WordItem = {
          id: `temp-${Date.now()}-${Math.random()}`,
          text: word,
          timestamp: Date.now(),
          isCommitted: false,
        };
        return [wordItem];
      }
      
      const lastWord = prevWords[prevWords.length - 1];
      
      if (!lastWord.isCommitted) {
        // Simply replace the temporary word - don't do complex overflow testing for live updates
        const updatedWord: WordItem = {
          ...lastWord,
          text: word,
          // Keep same timestamp so it doesn't restart fade animation
        };
        
        return [...prevWords.slice(0, -1), updatedWord];
      } else {
        // Last word is committed, add new temporary word
        const tempWord: WordItem = {
          id: `temp-${Date.now()}-${Math.random()}`,
          text: word,
          timestamp: Date.now(),
          isCommitted: false,
        };
        
        return [...prevWords, tempWord];
      }
    });
    
    return true;
  }, [isFadingOut]);

  const commitLatestWord = useCallback(() => {
    if (isFadingOut) return; // Don't commit if fading out
    
    setWords(prevWords => 
      prevWords.map(word => 
        !word.isCommitted 
          ? { ...word, isCommitted: true, timestamp: Date.now() }
          : word
      )
    );
  }, [isFadingOut]);
  
  // Set the addWord function on the ref
  useEffect(() => {
    addWordRef.current = addWord;
  }, [addWord, addWordRef]);

  // Set the replaceLatestWord function on the ref
  useEffect(() => {
    if (replaceLatestWordRef) {
      replaceLatestWordRef.current = replaceLatestWord;
    }
  }, [replaceLatestWord, replaceLatestWordRef]);

  // Set the commitLatestWord function on the ref
  useEffect(() => {
    if (commitLatestWordRef) {
      commitLatestWordRef.current = commitLatestWord;
    }
  }, [commitLatestWord, commitLatestWordRef]);

  // Log when fade state changes
  useEffect(() => {
    if (isFadingOut) {
      console.log('🔄 SpeechInputLine: isFadingOut state changed to TRUE - line should now be visually fading');
    }
  }, [isFadingOut]);
  
  return (
    <>
      {/* Hidden test element for measuring text width */}
      <div ref={testRef} className={styles.testElement} />
      
      <div 
        ref={lineRef} 
        style={{
          height: isFadingOut ? 0 : 32, // Fixed height instead of auto
          lineHeight: 32,
          minHeight: isFadingOut ? undefined : 32, // Remove min-height during animation
          overflowY: 'hidden',
          overflowX: 'visible',
          transition: isFadingOut ? 'height 0.3s ease-out, margin 0.8s ease-out, opacity 0.8s ease-out' : 'none',
          opacity: isFadingOut ? 0 : 1,
          background: isFadingOut ? 'rgba(255, 0, 0, 0.3)' : 'transparent', // Visual indicator
        }}
      >
        {words.map((word) => (
          <span
            key={word.id}
            id={word.id}
            className={`${styles.speechWord} ${word.isCommitted ? styles.committed : ''}`}
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