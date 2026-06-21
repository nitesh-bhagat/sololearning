import { Router, Request, Response } from 'express';
import { prisma } from '@sololearning/db';
import { requireAuth } from '../middlewares/auth.middleware';
import { cacheMiddleware } from '../middlewares/cache.middleware';
import { redisService } from '../services/redis';

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

// POST /api/courses
// Admin creates a new course with its full curriculum (chapters and topics)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, image, tags, totalXp, subject, chapters } = req.body;

    const subjectName = subject || 'General';
    let subjectRecord = await prisma.subject.findUnique({ where: { title: subjectName } });
    if (!subjectRecord) {
      subjectRecord = await prisma.subject.create({
        data: { title: subjectName, description: `Courses related to ${subjectName}` },
      });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        image,
        tags: tags || [],
        totalXp: totalXp || 0,
        subjectId: subjectRecord.id,
        chapters: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          create: chapters.map((ch: any, chIdx: number) => ({
            title: ch.title,
            description: ch.description,
            order: chIdx + 1,
            topics: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              create: ch.topics.map((t: any, tIdx: number) => ({
                title: t.title,
                description: t.description,
                order: tIdx + 1,
                xpReward: t.metadata?.xp || 50,
                content: t.content || [],
                excercise: t.excercise || [],
              })),
            },
          })),
        },
      },
    });

    // Invalidate the cache so the Search Page sees the updated data
    await redisService.invalidatePattern('courses:*');

    res.json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
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

      // Ensure CourseEnrollment exists or create it
      await prisma.courseEnrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: { lastActiveAt: new Date() },
        create: { userId, courseId },
      });

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

// GET /api/courses/:courseId/friends
// Fetches friends currently learning this course
router.get('/:courseId/friends', requireAuth, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).userId;

    // Find accepted friends where friendId or userId matches current user
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        user: true,
        friend: true,
      },
    });

    const friendIds = friendships.map((f) => (f.userId === userId ? f.friendId : f.userId));

    if (friendIds.length === 0) {
      return res.json([]);
    }

    // Find enrollments for these friends in this course
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        courseId,
        userId: { in: friendIds },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        currentChapter: {
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
    });

    // Format the response and include the latest topic progress
    const friendsLearning = await Promise.all(
      enrollments.map(async (e) => {
        // Find the most recently unlocked topic for this user in this course
        const latestProgress = await prisma.userProgress.findFirst({
          where: {
            userId: e.user.id,
            topic: {
              chapter: {
                courseId,
              },
            },
            isUnlocked: true,
          },
          orderBy: [{ topic: { chapter: { order: 'desc' } } }, { topic: { order: 'desc' } }],
          select: { topicId: true },
        });

        return {
          id: e.user.id,
          username: e.user.username,
          avatar: e.user.avatar,
          currentChapter: e.currentChapter ? e.currentChapter.title : 'Just started',
          lastActiveAt: e.lastActiveAt,
          activeTopicId: latestProgress ? latestProgress.topicId : null,
        };
      }),
    );

    res.json(friendsLearning);
  } catch (error) {
    console.error('Error fetching friends for course:', error);
    res.status(500).json({ error: 'Failed to fetch friends for course' });
  }
});

// (Removed GET /topics/:topicId/lessons as Lesson model is deleted)

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

        // Topics now hold content and exercise
        await prisma.topic.update({
          where: { id: topic.id },
          data: {
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

    // 1. Check if it was already completed
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
    });

    const wasAlreadyCompleted = existingProgress?.isCompleted === true;

    // 2. Mark current topic as completed
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

    // 3. Fetch the current topic to find its order and chapter
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

      // Update enrollment currentChapterId
      await prisma.courseEnrollment.updateMany({
        where: { userId, courseId: currentTopic.chapter.courseId },
        data: { currentChapterId: nextTopic.chapterId },
      });
    } else {
      // Completed entire course
      await prisma.courseEnrollment.updateMany({
        where: { userId, courseId: currentTopic.chapter.courseId },
        data: { isCompleted: true },
      });
    }

    // 5. Calculate New Rank and Streak
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (wasAlreadyCompleted) {
      // Return early with current stats, no XP awarded
      return res.json({
        message: 'Topic already completed',
        wasAlreadyCompleted: true,
        topicId: currentTopic.id,
        totalXp: currentUser.xp,
        newRank: currentUser.rank,
        newStreak: currentUser.streak,
      });
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

    // Invalidate the roadmap cache so the map updates instantly
    await redisService.invalidatePattern('roadmap:*');

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

// POST /api/courses/:courseId/reset
// Resets the user's progress for a specific course
router.post('/:courseId/reset', requireAuth, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).userId;

    // 1. Get all topic IDs for this course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            topics: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const topicIds = course.chapters.flatMap((chapter) => chapter.topics.map((t) => t.id));

    // 2. Delete all user progress for these topics
    if (topicIds.length > 0) {
      await prisma.userProgress.deleteMany({
        where: {
          userId,
          topicId: { in: topicIds },
        },
      });
    }

    // 3. Reset course enrollment
    const firstChapterId = course.chapters.length > 0 ? course.chapters[0].id : null;
    await prisma.courseEnrollment.updateMany({
      where: { userId, courseId },
      data: {
        isCompleted: false,
        currentChapterId: firstChapterId,
      },
    });

    // 4. Set the first topic as unlocked
    if (firstChapterId && course.chapters[0].topics.length > 0) {
      const firstTopicId = course.chapters[0].topics[0].id;
      await prisma.userProgress.create({
        data: {
          userId,
          topicId: firstTopicId,
          isUnlocked: true,
          isCompleted: false,
        },
      });
    }

    // Invalidate roadmap cache
    await redisService.invalidatePattern('roadmap:*');

    res.json({ success: true, message: 'Course progress reset successfully' });
  } catch (error) {
    console.error('Error resetting course progress:', error);
    res.status(500).json({ error: 'Failed to reset course progress' });
  }
});

export { router as coursesRouter };
