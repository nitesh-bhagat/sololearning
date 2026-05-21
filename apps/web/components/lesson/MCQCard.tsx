'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './LessonEngine.module.css';

interface MCQCardProps {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  onCorrect: () => void;
}

export function MCQCard({ question, options, correctAnswerIndex, onCorrect }: MCQCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleOptionClick = (index: number) => {
    // Prevent clicking if already correct
    if (isCorrect) return;

    setSelectedIndex(index);
    const correct = index === correctAnswerIndex;
    setIsCorrect(correct);

    if (correct) {
      // Small delay before moving to next question to show green state
      setTimeout(() => {
        onCorrect();
        // Reset state for next question if component is reused
        setSelectedIndex(null);
        setIsCorrect(null);
      }, 1000);
    } else {
      // Trigger shake animation for wrong answer
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500); // Reset shake state after animation
    }
  };

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{
        x: isShaking ? [-10, 10, -10, 10, 0] : 0,
        opacity: 1,
      }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <h2 className={styles.mcqTitle}>{question}</h2>

      <div className={styles.optionsGrid}>
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          let buttonClass = styles.optionButton;

          if (isSelected) {
            if (isCorrect) buttonClass += ` ${styles.correct}`;
            else buttonClass += ` ${styles.incorrect}`;
          }

          return (
            <button
              key={index}
              className={buttonClass}
              onClick={() => handleOptionClick(index)}
              disabled={isCorrect === true}
            >
              {option}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
