'use client';

import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Award, Zap, ShieldCheck } from 'lucide-react';
import styles from './admin.module.css';

import { Skeleton } from '@sololearning/ui';
import { useToast } from '../../../components/ToastProvider';

// ... interface definitions are kept intact by replacing after imports

interface StatItem {
  totalUsers: number;
  totalXP: number;
  avgXP: number;
  totalLessonsCompleted: number;
  activeUsersCount: number;
}

interface ChartPoint {
  date: string;
  count: number;
}

interface AnalyticsData {
  stats: StatItem;
  charts: {
    recentRegistrations: ChartPoint[];
    lessonCompletionsByDay: ChartPoint[];
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics', { credentials: 'include' });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        } else {
          toast.error('Failed to load platform analytics');
        }
      } catch (err) {
        toast.error('Network error loading analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [toast]);

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: '20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          <Skeleton height="100px" borderRadius="12px" />
          <Skeleton height="100px" borderRadius="12px" />
          <Skeleton height="100px" borderRadius="12px" />
          <Skeleton height="100px" borderRadius="12px" />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '20px',
          }}
        >
          <Skeleton height="200px" borderRadius="12px" />
          <Skeleton height="200px" borderRadius="12px" />
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { stats, charts } = data;

  // Custom Inline SVG helper to draw Line Charts safely
  const renderLineChart = (points: ChartPoint[], strokeColor: string, fillColor: string) => {
    if (!points || points.length === 0) return null;

    const width = 500;
    const height = 150;
    const maxVal = Math.max(...points.map((p) => p.count), 5); // at least max height 5 for visual scaling
    const padding = 30;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Map points to SVG coordinates
    const coordinates = points.map((p, index) => {
      const x = padding + (index / (points.length - 1)) * chartWidth;
      const y = height - padding - (p.count / maxVal) * chartHeight;
      return { x, y, count: p.count, label: p.date };
    });

    // Build SVG path
    let pathD = '';
    let areaD = `M ${coordinates[0].x} ${height - padding}`; // starting bottom corner for fill area

    coordinates.forEach((c, index) => {
      if (index === 0) {
        pathD = `M ${c.x} ${c.y}`;
      } else {
        pathD += ` L ${c.x} ${c.y}`;
      }
      areaD += ` L ${c.x} ${c.y}`;
    });

    areaD += ` L ${coordinates[coordinates.length - 1].x} ${height - padding} Z`;

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={styles.svgWrapper}
        style={{ overflow: 'visible' }}
      >
        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + ratio * chartHeight;
          const val = Math.round(maxVal * (1 - ratio));
          return (
            <g key={ratio} opacity="0.15">
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#fff"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <text x={padding - 8} y={y + 4} fill="#fff" fontSize="10" textAnchor="end">
                {val}
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        <path d={areaD} fill={fillColor} opacity="0.1" />

        {/* Stroke Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Nodes */}
        {coordinates.map((c, index) => (
          <g key={index}>
            <circle cx={c.x} cy={c.y} r="5" fill="#121218" stroke={strokeColor} strokeWidth="2.5" />
            <text
              x={c.x}
              y={height - 8}
              fill="var(--color-text-light)"
              fontSize="9"
              textAnchor="middle"
            >
              {c.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div>
      {/* 4 Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Total Registered Students</span>
            <div className={styles.statIcon} style={{ color: '#6366f1' }}>
              <Users size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.totalUsers}</div>
          <div className={styles.statValueSmall}>Students globally</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Platform Total XP Earned</span>
            <div className={styles.statIcon} style={{ color: '#a855f7' }}>
              <Award size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.totalXP.toLocaleString()}</div>
          <div className={styles.statValueSmall}>Avg. {stats.avgXP} XP / user</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Lessons Completed</span>
            <div className={styles.statIcon} style={{ color: '#10b981' }}>
              <BookOpen size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.totalLessonsCompleted}</div>
          <div className={styles.statValueSmall}>Mastered study sessions</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>Active Users (Last 24h)</span>
            <div className={styles.statIcon} style={{ color: '#f59e0b' }}>
              <Zap size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{stats.activeUsersCount}</div>
          <div className={styles.statValueSmall}>Engaged learners today</div>
        </div>
      </div>

      {/* SVG Charts */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>User Registrations (Last 7 Days)</h3>
          {renderLineChart(charts.recentRegistrations, '#6366f1', '#6366f1')}
        </div>

        <div className={styles.chartCard}>
          <h3>Lesson Completion Volume (Last 7 Days)</h3>
          {renderLineChart(charts.lessonCompletionsByDay, '#10b981', '#10b981')}
        </div>
      </div>
    </div>
  );
}
