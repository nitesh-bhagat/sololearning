import React from 'react';
import styles from './help.module.css';
import { Book, MessageCircle, Swords, Trophy } from 'lucide-react';

const HELP_CATEGORIES = [
  {
    id: 1,
    title: 'Getting Started',
    desc: 'Learn how to navigate the platform, set up your profile, and start learning.',
    icon: <Book className="text-blue-500" size={24} />,
    bg: 'rgba(59, 130, 246, 0.1)',
  },
  {
    id: 2,
    title: 'Battleground Rules',
    desc: 'Understand how challenges, scoring, and matchmaking work in the arena.',
    icon: <Swords className="text-rose-500" size={24} />,
    bg: 'rgba(244, 63, 94, 0.1)',
  },
  {
    id: 3,
    title: 'Tournaments',
    desc: 'Details on joining global championships, weekend hackathons, and climbing the ranks.',
    icon: <Trophy className="text-amber-500" size={24} />,
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  {
    id: 4,
    title: 'Community & Chat',
    desc: 'Guidelines for interacting with other learners and managing your friends list.',
    icon: <MessageCircle className="text-emerald-500" size={24} />,
    bg: 'rgba(16, 185, 129, 0.1)',
  },
];

const FAQS = [
  {
    q: 'How do I challenge a friend?',
    a: 'Navigate to the Battleground tab, find your friend under "Challenge Now", and click the Challenge button to send an invite.',
  },
  {
    q: 'How is my global ranking calculated?',
    a: 'Your ranking is based on the XP earned from completing courses, winning battleground matches, and participating in tournaments.',
  },
  {
    q: 'Can I change my username?',
    a: 'Currently, usernames are permanently tied to your account upon creation to maintain leaderboard integrity.',
  },
];

export default function HelpPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>How can we help?</h1>
        <p className={styles.subtitle}>
          Browse our knowledge base or check the frequently asked questions to find the answers you
          need.
        </p>
      </div>

      <div className={styles.grid}>
        {HELP_CATEGORIES.map((category) => (
          <div key={category.id} className={styles.card}>
            <div className={styles.iconWrapper} style={{ backgroundColor: category.bg }}>
              {category.icon}
            </div>
            <div>
              <h3 className={styles.cardTitle}>{category.title}</h3>
              <p className={styles.cardDesc}>{category.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        {FAQS.map((faq, i) => (
          <div key={i} className={styles.faqItem}>
            <div className={styles.question}>{faq.q}</div>
            <div className={styles.answer}>{faq.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
