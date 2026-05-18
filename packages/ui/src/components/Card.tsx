import React from 'react';
import styles from './card.module.css';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', children, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx(styles.card, styles[`pad-${padding}`], className)} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
