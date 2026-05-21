import { Router, Request, Response } from 'express';
import { prisma } from '@sololearning/db';
import { requireAuth } from '../middlewares/auth.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// GET /api/courses
// Lists all available subjects and courses
router.get('/', cacheMiddleware(3600, 'courses:'), async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        courses: true,
      },
    });
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/courses/:courseId/roadmap
// Fetches the full roadmap (Chapters & Topics) and attaches user progress
router.get(
  '/:courseId/roadmap',
  requireAuth,
  cacheMiddleware(3600, 'roadmap:'),
  async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userId = (req as any).userId;

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          chapters: {
            orderBy: { order: 'asc' },
            include: {
              topics: {
                orderBy: { order: 'asc' },
                include: {
                  progress: {
                    where: { userId },
                  },
                },
              },
            },
          },
        },
      });

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json(course);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      res.status(500).json({ error: 'Failed to fetch roadmap' });
    }
  },
);

// GET /api/courses/topics/:topicId/lessons
// Fetches lessons for a specific topic
router.get('/topics/:topicId/lessons', requireAuth, async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    const lessons = await prisma.lesson.findMany({
      where: { topicId },
      orderBy: { order: 'asc' },
    });

    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// POST /api/courses/seed
// Generates a robust dummy "Python" course for testing
router.post('/seed', async (req: Request, res: Response) => {
  try {
    // 1. Create Subject
    const subject = await prisma.subject.upsert({
      where: { title: 'Python' },
      update: {},
      create: {
        title: 'Python',
        description: "Learn the world's most popular programming language.",
        icon: '🐍',
      },
    });

    // 2. Create Course
    const course = await prisma.course.create({
      data: {
        title: 'Python for Beginners',
        description: 'Master the basics of Python 3.',
        subjectId: subject.id,
      },
    });

    // 3. Create Chapters & Topics
    const chaptersData = [
      {
        title: 'Getting Started',
        order: 1,
        topics: ['Hello World', 'Variables', 'Data Types'],
      },
      {
        title: 'Control Flow',
        order: 2,
        topics: ['If Statements', 'For Loops', 'While Loops'],
      },
      {
        title: 'Functions & Modules',
        order: 3,
        topics: ['Def Functions', 'Return Values', 'Importing'],
      },
    ];

    for (const chData of chaptersData) {
      const chapter = await prisma.chapter.create({
        data: {
          title: chData.title,
          order: chData.order,
          courseId: course.id,
        },
      });

      let topicOrder = 1;
      for (const topicTitle of chData.topics) {
        const topic = await prisma.topic.create({
          data: {
            title: topicTitle,
            order: topicOrder++,
            chapterId: chapter.id,
            xpReward: 50,
          },
        });

        // Add dummy lessons to the topic
        await prisma.lesson.create({
          data: {
            title: `Learn ${topicTitle}`,
            order: 1,
            topicId: topic.id,
            xpReward: 10,
            content: [
              { type: 'info', text: `Welcome to the ${topicTitle} lesson!` },
              {
                type: 'mcq',
                question: `What is the main concept of ${topicTitle}?`,
                options: ['Option A', 'Option B', 'Option C'],
                answer: 0,
              },
            ],
          },
        });
      }
    }

    res.json({ message: 'Dummy Python course seeded successfully', courseId: course.id });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ error: 'Failed to seed data' });
  }
});

// POST /api/courses/topics/:topicId/complete
// Marks a topic as completed, unlocks the next topic, and awards XP
router.post('/topics/:topicId/complete', requireAuth, async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).userId;

    // 1. Mark current topic as completed
    const currentTopicProgress = await prisma.userProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
      create: {
        userId,
        topicId,
        isCompleted: true,
        isUnlocked: true,
        completedAt: new Date(),
      },
    });

    // 2. Fetch the current topic to find its order and chapter
    const currentTopic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        chapter: {
          include: {
            topics: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!currentTopic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // 3. Find the next topic in the chapter
    const topics = currentTopic.chapter.topics;
    const currentIndex = topics.findIndex((t) => t.id === topicId);
    let nextTopic = null;

    if (currentIndex !== -1 && currentIndex < topics.length - 1) {
      nextTopic = topics[currentIndex + 1];
    } else {
      // If no next topic in this chapter, find the next chapter
      const currentChapter = await prisma.chapter.findUnique({
        where: { id: currentTopic.chapterId },
        include: {
          course: {
            include: {
              chapters: {
                orderBy: { order: 'asc' },
                include: {
                  topics: {
                    orderBy: { order: 'asc' },
                  },
                },
              },
            },
          },
        },
      });

      if (currentChapter) {
        const chapters = currentChapter.course.chapters;
        const currentChapIndex = chapters.findIndex((c) => c.id === currentChapter.id);

        if (currentChapIndex !== -1 && currentChapIndex < chapters.length - 1) {
          const nextChapter = chapters[currentChapIndex + 1];
          if (nextChapter.topics && nextChapter.topics.length > 0) {
            nextTopic = nextChapter.topics[0];
          }
        }
      }
    }

    // 4. Unlock the next topic if it exists
    if (nextTopic) {
      await prisma.userProgress.upsert({
        where: {
          userId_topicId: {
            userId,
            topicId: nextTopic.id,
          },
        },
        update: {
          isUnlocked: true,
        },
        create: {
          userId,
          topicId: nextTopic.id,
          isUnlocked: true,
          isCompleted: false,
        },
      });
    }

    // 5. Calculate New Rank and Streak
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newXp = currentUser.xp + currentTopic.xpReward;
    let newRank = currentUser.rank;

    // Rank Thresholds
    if (newXp >= 3000) newRank = 'Gold';
    else if (newXp >= 1500) newRank = 'Silver';
    else if (newXp >= 500) newRank = 'Bronze';
    else newRank = 'Newbie';

    // Streak Logic
    let newStreak = currentUser.streak;
    const now = new Date();
    // In a real app we'd track the last active date.
    // For MVP, we check if updatedAt is older than 24h but less than 48h.
    // If it's been more than 48h, streak resets to 1.
    // If it's been > 24h but < 48h, streak increments.
    // Since we don't have a specific lastActive field, we'll use updatedAt.
    // Let's simplify for MVP: every time they complete a topic, if it's a new calendar day, increment streak.
    const lastActive = currentUser.updatedAt;
    const isSameDay = lastActive.toDateString() === now.toDateString();

    // We'll just increment it for demonstration if it's not the same day.
    if (!isSameDay) {
      const hoursDiff = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
      if (hoursDiff <= 48) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        rank: newRank,
        streak: newStreak,
        updatedAt: now,
      },
    });

    // 6. Generate Activity
    await prisma.activity.create({
      data: {
        userId,
        type: 'LESSON_COMPLETED',
        content: `Completed ${currentTopic.title}`,
        metadata: { xpGained: currentTopic.xpReward, topicId },
      },
    });

    if (newRank !== currentUser.rank) {
      await prisma.activity.create({
        data: {
          userId,
          type: 'RANK_UP',
          content: `Reached rank ${newRank}!`,
          metadata: { newRank },
        },
      });
    }

    res.json({
      success: true,
      xpGained: currentTopic.xpReward,
      totalXp: updatedUser.xp,
      newRank: updatedUser.rank,
      newStreak: updatedUser.streak,
      nextTopicUnlocked: nextTopic ? nextTopic.id : null,
    });
  } catch (error) {
    console.error('Error completing topic:', error);
    res.status(500).json({ error: 'Failed to complete topic' });
  }
});

export { router as coursesRouter };
