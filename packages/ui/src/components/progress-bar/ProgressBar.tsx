import React from 'react';
import styles from './progressbar.module.css';
import { clsx } from 'clsx';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
  color?: 'primary' | 'secondary' | 'warning';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  color = 'primary',
}) => {
  const boundedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={clsx(styles.track, className)}>
      <div className={clsx(styles.fill, styles[color])} style={{ width: `${boundedProgress}%` }}>
        <div className={styles.highlight} />
      </div>
    </div>
  );
};
