'use client';

import React, { useEffect, useState } from 'react';
import styles from './Roadmap.module.css';
import { RoadmapNode, NodeState } from './RoadmapNode';

interface RoadmapProps {
  courseId: string;
  friendsProgress?: Array<{ id: string; username: string; avatar: string; activeTopicId: string }>;
}

export function Roadmap({ courseId, friendsProgress = [] }: RoadmapProps) {
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}/roadmap`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setCourseData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [courseId]);

  if (loading)
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading Roadmap...</div>;
  if (!courseData)
    return <div style={{ textAlign: 'center', padding: '40px' }}>Course not found.</div>;

  // Flatten topics to render them in a single line
  const allTopics: any[] = [];
  courseData.chapters.forEach((chapter: any) => {
    chapter.topics.forEach((topic: any) => {
      allTopics.push({ ...topic, chapterTitle: chapter.title });
    });
  });

  // SVG Path logic
  // We draw a smooth bezier curve down the center connecting the nodes.
  // Each node has a height of ~70px and gap of 60px = 130px vertical spacing.
  const pathParts: string[] = [];
  let currentY = 40 + 35; // paddingTop + half node height

  allTopics.forEach((topic, i) => {
    const offset = Math.sin(i * 0.8) * 80;
    const x = 100 + offset; // 100 is center of the 200px SVG
    const y = currentY;

    if (i === 0) {
      pathParts.push(`M ${x} ${y}`);
    } else {
      // Draw smooth curve from previous point
      const prevOffset = Math.sin((i - 1) * 0.8) * 80;
      const prevX = 100 + prevOffset;
      const prevY = currentY - 130;

      // Control points for smooth vertical S-curve
      const cp1X = prevX;
      const cp1Y = prevY + 65;
      const cp2X = x;
      const cp2Y = y - 65;

      pathParts.push(`C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${x} ${y}`);
    }

    currentY += 130;
  });

  const pathString = pathParts.join(' ');
  const svgHeight = currentY;

  return (
    <div className={styles.container}>
      <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>{courseData.title}</h1>

      {/* The curved path connecting the nodes */}
      <svg
        className={styles.roadmapPath}
        viewBox={`0 0 200 ${svgHeight}`}
        style={{ height: svgHeight }}
      >
        <path
          d={pathString}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Draw a glowing path over the completed portions (MVP simplified) */}
      </svg>

      <div className={styles.nodesContainer}>
        {allTopics.map((topic, index) => {
          // Determine state based on userProgress
          // If no userProgress exists for any node, make the first one UNLOCKED
          const isFirstNode = index === 0;
          const hasProgress = topic.progress && topic.progress.length > 0;
          let state: NodeState = 'LOCKED';

          if (hasProgress) {
            const p = topic.progress[0];
            if (p.isCompleted) state = 'COMPLETED';
            else if (p.isUnlocked) state = 'UNLOCKED';
          } else if (isFirstNode) {
            // First node is always unlocked if not completed
            state = 'UNLOCKED';
          }

          const matchingFriends = friendsProgress.filter((f) => f.activeTopicId === topic.id);

          return (
            <RoadmapNode
              key={topic.id}
              id={topic.id}
              title={topic.title}
              state={state}
              index={index}
              friends={matchingFriends}
              onClick={() => {
                if (state !== 'LOCKED') {
                  window.location.href = `/lesson/${topic.id}`;
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
