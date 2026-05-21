'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Star, Check, Lock } from 'lucide-react';
import styles from './Roadmap.module.css';
import { motion } from 'framer-motion';

export type NodeState = 'LOCKED' | 'UNLOCKED' | 'COMPLETED';

interface RoadmapNodeProps {
  id: string;
  title: string;
  state: NodeState;
  index: number;
  friends?: Array<{ id: string; username: string; avatar: string }>;
  onClick: () => void;
}

export function RoadmapNode({ title, state, index, friends = [], onClick }: RoadmapNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '400px', // Render when within 400px of viewport
        threshold: 0,
      },
    );
    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Calculate horizontal offset to create a snake pattern
  // Amplitude is 80px left and right of center
  const offset = Math.sin(index * 0.8) * 80;

  return (
    <div
      ref={nodeRef}
      className={`${styles.nodeWrapper} ${styles[state.toLowerCase()]}`}
      style={{ transform: `translateX(${offset}px)`, minHeight: '80px' }}
    >
      {isVisible ? (
        <>
          <motion.button
            className={styles.nodeButton}
            onClick={onClick}
            disabled={state === 'LOCKED'}
            whileHover={state !== 'LOCKED' ? { scale: 1.1 } : {}}
            whileTap={state !== 'LOCKED' ? { scale: 0.95 } : {}}
          >
            <div className={styles.iconContainer}>
              {state === 'COMPLETED' && <Check size={32} color="white" />}
              {state === 'UNLOCKED' && <Star size={32} color="white" />}
              {state === 'LOCKED' && <Lock size={24} color="#a0a0a0" />}
            </div>
          </motion.button>

          {/* Friend pins stack */}
          {friends.length > 0 && (
            <div
              style={{
                position: 'absolute',
                left: offset >= 0 ? '-38px' : '78px',
                top: '20px',
                display: 'flex',
                alignItems: 'center',
                zIndex: 10,
              }}
            >
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  title={friend.username}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-surface)',
                    border: '2px solid var(--color-primary)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginLeft: '-8px', // Stack overlapping effect
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.2) translateY(-2px)';
                    e.currentTarget.style.zIndex = '20';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.zIndex = 'auto';
                  }}
                >
                  {friend.avatar || friend.username.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          )}

          {/* Tooltip-like label */}
          <div className={styles.nodeLabel}>{title}</div>
        </>
      ) : (
        <div style={{ width: '70px', height: '70px' }} />
      )}
    </div>
  );
}
