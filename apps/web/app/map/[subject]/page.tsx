'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './map.module.css';

// Mock Data
const subjectData = {
  python: { title: 'Python Basics', levels: 15, currentLevel: 5 },
  cs: { title: 'CS Fundamentals', levels: 10, currentLevel: 2 },
  math: { title: 'Mathematics', levels: 20, currentLevel: 12 },
  physics: { title: 'Physics', levels: 12, currentLevel: 1 },
};

const friends = [
  { id: 1, name: 'Alex', avatar: 'A', level: 6 },
  { id: 2, name: 'Sam', avatar: 'S', level: 3 },
  { id: 3, name: 'Jo', avatar: 'J', level: 8 },
];

export default function MapPage() {
  const params = useParams();
  const subjectId = (params.subject as string) || 'python';
  const data = subjectData[subjectId as keyof typeof subjectData] || subjectData.python;
  
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Generate levels data and path coordinates
  const { levels, pathData } = useMemo(() => {
    const arr = [];
    const points = [];
    const nodeSpacingY = 120; // Reduced spacing for mobile
    const amplitude = 80; // Reduced curve width for mobile
    
    const totalHeight = data.levels * nodeSpacingY;
    
    for (let i = 0; i < data.levels; i++) {
      let status = 'locked';
      if (i + 1 < data.currentLevel) status = 'completed';
      if (i + 1 === data.currentLevel) status = 'current';
      
      const xOffset = Math.sin((i / 2) * Math.PI) * amplitude;
      
      arr.push({
        id: i + 1,
        status,
        x: xOffset,
        stars: status === 'completed' ? Math.floor(Math.random() * 3) + 1 : 0
      });
      
      // Center at 250px (assuming max width 500)
      const y = totalHeight - (i * nodeSpacingY) - 40; 
      const x = 250 + xOffset;
      points.push(`${x},${y}`);
    }
    
    let d = `M ${points[0]}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1].split(',');
      const curr = points[i].split(',');
      const cp1y = parseInt(prev[1]) - nodeSpacingY / 2;
      const cp2y = parseInt(curr[1]) + nodeSpacingY / 2;
      d += ` C ${prev[0]},${cp1y} ${curr[0]},${cp2y} ${curr[0]},${curr[1]}`;
    }
    
    return { levels: arr, pathData: d };
  }, [data.levels, data.currentLevel]);

  return (
    <div className={styles.mapContainer}>
      <header className={styles.mapHeader}>
        <Link href="/">
          <div className={styles.backButton}>← Back</div>
        </Link>
        <h1 className={styles.title}>{data.title}</h1>
        <div style={{ width: '60px' }}></div>
      </header>

      {/* Social Sidebar (Desktop Only) */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Community <span>👥</span></h2>
        <div className={styles.friendList}>
          {friends.map(f => (
            <div key={f.id} className={styles.friend}>
              <div className={styles.avatar}>{f.avatar}</div>
              <div>
                <strong style={{ color: 'var(--text-color)' }}>{f.name}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Level {f.level}</div>
              </div>
            </div>
          ))}
        </div>
        <button 
          className={styles.inviteBtn}
          onClick={() => setShowInviteModal(true)}
        >
          Invite Friends
        </button>
      </aside>

      <div className={styles.levelsWrapper} style={{ height: data.levels * 120 }}>
        {/* Winding Path SVG */}
        <svg 
          className={styles.pathSvg} 
          viewBox={`0 0 500 ${data.levels * 120}`}
          preserveAspectRatio="none"
        >
          <path d={pathData} className={styles.pathLine} />
        </svg>

        {levels.map((level) => (
          <div 
            key={level.id} 
            className={`${styles.levelNode} ${styles[level.status]}`}
            style={{ transform: `translateX(${level.x}px)` }}
          >
            <span className={styles.levelNumber}>{level.id}</span>
            {level.status === 'completed' && (
              <div className={styles.stars}>
                {'★'.repeat(level.stars)}
              </div>
            )}
            
            {/* Friends avatars at this level */}
            {friends.filter(f => f.level === level.id).map((f, index) => (
              <div 
                key={f.id}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: index * -15 - 10 + 'px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                  fontWeight: '600',
                  color: 'var(--text-color)',
                  zIndex: 3
                }}
              >
                {f.avatar}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Simple Invite Modal */}
      {showInviteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)'
        }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', textAlign: 'center', maxWidth: '400px', width: '90%', border: '1px solid var(--border-color)' }}>
            <h2 style={{ color: 'var(--text-color)' }}>Invite to {data.title}</h2>
            <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>Share this link so friends can join your learning journey!</p>
            <input type="text" value="https://sololearning.app/invite/abc123xyz" readOnly style={{ 
              width: '100%', padding: '0.8rem', marginBottom: '1.5rem', 
              border: '1px solid var(--border-color)', borderRadius: '8px',
              background: 'var(--bg-color)', color: 'var(--text-color)'
            }}/>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className={styles.inviteBtn} style={{ margin: 0 }} onClick={() => setShowInviteModal(false)}>Copy Link</button>
              <button className={styles.inviteBtn} style={{ margin: 0, background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }} onClick={() => setShowInviteModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
