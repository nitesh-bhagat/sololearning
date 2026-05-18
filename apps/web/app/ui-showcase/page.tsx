import React from 'react';
import { Button, Card, ProgressBar } from '@sololearning/ui';
import { ThemeToggle } from '../../components/ThemeToggle';

export default function UIShowcase() {
  return (
    <div
      style={{
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>SoloLearning UI Showcase</h1>
        <ThemeToggle />
      </div>

      <section>
        <h2>Buttons</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg">
            Continue
          </Button>
          <Button variant="secondary" size="md">
            Check
          </Button>
          <Button variant="danger" size="sm">
            Report
          </Button>
          <Button variant="ghost">Skip</Button>
        </div>
      </section>

      <section>
        <h2>Cards</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <Card padding="lg">
            <h3>Lesson 1</h3>
            <p>Learn the basics of JavaScript.</p>
            <Button variant="primary" style={{ marginTop: '16px' }}>
              Start
            </Button>
          </Card>
          <Card padding="md" style={{ backgroundColor: 'var(--color-surface)' }}>
            <h3>Daily Quests</h3>
            <p>Earn 50 XP to unlock a chest.</p>
          </Card>
        </div>
      </section>

      <section>
        <h2>Progress Bars</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <ProgressBar progress={30} color="primary" />
          <ProgressBar progress={75} color="secondary" />
          <ProgressBar progress={90} color="warning" />
        </div>
      </section>
    </div>
  );
}
