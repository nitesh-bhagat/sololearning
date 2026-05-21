'use client';

import React from 'react';
import { LessonEngine } from '../../../../components/lesson/LessonEngine';

export default function LessonPage({ params }: { params: { topicId: string } }) {
  return <LessonEngine topicId={params.topicId} />;
}
