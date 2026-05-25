'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CourseMap } from './components/CourseMap';
import { useCourse } from './CourseContext';

export default function CoursePage() {
  const { courseData, friendsProgress } = useCourse();
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const chapterId = entry.target.getAttribute('data-chapter-id');
            if (chapterId) {
              // Update URL without scrolling so the sidebar can detect active chapter
              router.replace(`?chapter=${chapterId}`, { scroll: false });

              // Scroll the sidebar to the active chapter button
              const sidebarBtn = document.getElementById(`sidebar-btn-${chapterId}`);
              const sidebarContainer = document.getElementById('sidebar-container');
              if (sidebarBtn && sidebarContainer) {
                const scrollPos = sidebarBtn.offsetTop - sidebarContainer.offsetTop - 20;
                sidebarContainer.scrollTo({ top: scrollPos, behavior: 'smooth' });
              }
            }
          }
        });
      },
      {
        root: document.getElementById('main-scroll-container'),
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0,
      },
    );

    const elements = document.querySelectorAll('.chapter-header-spy');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [router]);

  return <CourseMap courseData={courseData} friendsProgress={friendsProgress} />;
}
