import Link from 'next/link';
import styles from './page.module.css';

const subjects = [
  { id: 'python', name: 'Python Basics', subtitle: '15 Levels', icon: '🐍', theme: 'Python' },
  { id: 'cs', name: 'CS Fundamentals', subtitle: '10 Levels', icon: '💻', theme: 'CS' },
  { id: 'math', name: 'Mathematics', subtitle: '20 Levels', icon: '📐', theme: 'Math' },
  { id: 'physics', name: 'Physics', subtitle: '12 Levels', icon: '⚛️', theme: 'Physics' },
];

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Subjects</h1>
        <p className={styles.subtitle}>Select a subject to continue your journey</p>
      </header>

      <div className={styles.grid}>
        {subjects.map((subject) => (
          <Link href={`/map/${subject.id}`} key={subject.id}>
            <div className={`${styles.card} ${styles[`card${subject.theme}`]}`}>
              <div className={styles.iconWrapper}>
                {subject.icon}
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{subject.name}</h2>
                <span className={styles.cardSubtitle}>{subject.subtitle}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
