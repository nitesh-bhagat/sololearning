import { Router, Request, Response } from 'express';
import { prisma } from '@sololearning/db';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/courses
// Lists all available subjects and courses
router.get('/', async (req: Request, res: Response) => {
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
router.get('/:courseId/roadmap', requireAuth, async (req: Request, res: Response) => {
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
});

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

export { router as coursesRouter };
