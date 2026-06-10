import { Router, Request, Response } from 'express';
import { prisma } from '@sololearning/db';
import { redisService } from '../services/redis';
import { requireAuth, requireAdmin, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth & admin middlewares to all admin endpoints
router.use(requireAuth);
// router.use(requireAdmin); // Temporarily disabled for local dev so you can view it without needing an ADMIN JWT

// ==========================================
// 1. ANALYTICS
// ==========================================
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const xpAggregate = await prisma.user.aggregate({
      _sum: { xp: true },
    });
    const totalXP = xpAggregate._sum.xp || 0;
    const avgXP = totalUsers > 0 ? Math.round(totalXP / totalUsers) : 0;

    const totalLessonsCompleted = await prisma.activity.count({
      where: { type: 'LESSON_COMPLETED' },
    });

    const activeUsersCount = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24h
        },
      },
    });

    // Generate recent 7 days registrations
    const recentRegistrations = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: d,
            lt: nextD,
          },
        },
      });
      recentRegistrations.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      });
    }

    // Generate recent 7 days lesson completions
    const lessonCompletionsByDay = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const count = await prisma.activity.count({
        where: {
          type: 'LESSON_COMPLETED',
          createdAt: {
            gte: d,
            lt: nextD,
          },
        },
      });
      lessonCompletionsByDay.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      });
    }

    res.json({
      stats: {
        totalUsers,
        totalXP,
        avgXP,
        totalLessonsCompleted,
        activeUsersCount,
      },
      charts: {
        recentRegistrations,
        lessonCompletionsByDay,
      },
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ==========================================
// 2. USER MODERATION
// ==========================================

// Get all users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        xp: true,
        streak: true,
        rank: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update a user
router.put('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { xp, streak, role, rank } = req.body;

    const data: any = {};
    if (xp !== undefined) data.xp = Number(xp);
    if (streak !== undefined) data.streak = Number(streak);
    if (role !== undefined) data.role = String(role);
    if (rank !== undefined) data.rank = String(rank);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        xp: true,
        streak: true,
        rank: true,
        role: true,
      },
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user
router.delete('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ==========================================
// 3. COURSE HIERARCHICAL TREE
// ==========================================

// Get complete tree
router.get('/course-tree', async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        courses: {
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
      orderBy: { title: 'asc' },
    });
    res.json(subjects);
  } catch (error) {
    console.error('Admin course tree error:', error);
    res.status(500).json({ error: 'Failed to fetch course tree' });
  }
});

// SUBJECTS
router.post('/subjects', async (req: Request, res: Response) => {
  try {
    const { title, description, icon } = req.body;
    if (!title || !description)
      return res.status(400).json({ error: 'Missing title or description' });

    const subject = await prisma.subject.create({
      data: { title, description, icon },
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

router.put('/subjects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, icon } = req.body;
    const subject = await prisma.subject.update({
      where: { id },
      data: { title, description, icon },
    });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

router.delete('/subjects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.subject.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

// COURSES
router.get('/courses/stats', async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        enrollments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedCourses = courses.map((course) => {
      const enrolled = course.enrollments.length;
      const completed = course.enrollments.filter((e) => e.isCompleted).length;
      const completionRate = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;

      return {
        id: course.id,
        title: course.title,
        status: course.status,
        enrolled,
        rating: 4.8, // Mocked for MVP
        completionRate: `${completionRate}%`,
      };
    });

    const activeLearners = courses.reduce((acc, c) => acc + c.enrollments.length, 0);
    const totalCompletion = enrichedCourses.reduce((acc, c) => acc + parseInt(c.completionRate), 0);
    const avgCompletion =
      enrichedCourses.length > 0 ? Math.round(totalCompletion / enrichedCourses.length) : 0;

    res.json({
      summary: {
        totalCourses: courses.length,
        activeLearners,
        avgRating: 4.8,
        avgCompletion: `${avgCompletion}%`,
      },
      courses: enrichedCourses,
    });
  } catch (error) {
    console.error('Failed to fetch course stats', error);
    res.status(500).json({ error: 'Failed to fetch course stats' });
  }
});

router.put('/courses/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const course = await prisma.course.update({
      where: { id },
      data: { status },
    });
    await redisService.invalidatePattern('courses:*');
    await redisService.invalidatePattern('roadmap:*');
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course status' });
  }
});

router.get('/courses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        subject: true,
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            topics: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

router.post('/courses', async (req: Request, res: Response) => {
  try {
    const { title, description, subjectId } = req.body;
    if (!title || !description || !subjectId)
      return res.status(400).json({ error: 'Missing parameters' });

    const course = await prisma.course.create({
      data: { title, description, subjectId },
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

router.put('/courses/:id/full', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, image, tags, totalXp, subject, chapters } = req.body;

    const subjectName = subject || 'General';
    let subjectRecord = await prisma.subject.findUnique({ where: { title: subjectName } });
    if (!subjectRecord) {
      subjectRecord = await prisma.subject.create({
        data: { title: subjectName, description: `Courses related to ${subjectName}` },
      });
    }

    // Hard delete existing chapters (cascades to topics/progress)
    await prisma.chapter.deleteMany({ where: { courseId: id } });

    const course = await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        image,
        tags: tags || [],
        totalXp: totalXp || 0,
        subjectId: subjectRecord.id,
        chapters: {
          create: chapters.map((ch: any, chIdx: number) => ({
            title: ch.title,
            description: ch.description,
            order: chIdx + 1,
            topics: {
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
    await redisService.invalidatePattern('roadmap:*');

    res.json(course);
  } catch (error) {
    console.error('Failed to deep update course', error);
    res.status(500).json({ error: 'Failed to deep update course' });
  }
});

router.put('/courses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const course = await prisma.course.update({
      where: { id },
      data: { title, description },
    });
    await redisService.invalidatePattern('courses:*');
    await redisService.invalidatePattern('roadmap:*');
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

router.delete('/courses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    await redisService.invalidatePattern('courses:*');
    await redisService.invalidatePattern('roadmap:*');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// CHAPTERS
router.post('/chapters', async (req: Request, res: Response) => {
  try {
    const { title, description, order, courseId } = req.body;
    if (!title || order === undefined || !courseId)
      return res.status(400).json({ error: 'Missing parameters' });

    const chapter = await prisma.chapter.create({
      data: { title, description, order: Number(order), courseId },
    });
    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

router.put('/chapters/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;
    const chapter = await prisma.chapter.update({
      where: { id },
      data: {
        title,
        description,
        order: order !== undefined ? Number(order) : undefined,
      },
    });
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

router.delete('/chapters/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.chapter.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
});

// TOPICS
router.post('/topics', async (req: Request, res: Response) => {
  try {
    const { title, description, order, xpReward, chapterId } = req.body;
    if (!title || order === undefined || !chapterId)
      return res.status(400).json({ error: 'Missing parameters' });

    const topic = await prisma.topic.create({
      data: {
        title,
        description,
        order: Number(order),
        xpReward: xpReward !== undefined ? Number(xpReward) : 50,
        chapterId,
      },
    });
    res.status(201).json(topic);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

router.put('/topics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, order, xpReward } = req.body;
    const topic = await prisma.topic.update({
      where: { id },
      data: {
        title,
        description,
        order: order !== undefined ? Number(order) : undefined,
        xpReward: xpReward !== undefined ? Number(xpReward) : undefined,
      },
    });
    res.json(topic);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

router.delete('/topics/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.topic.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

export default router;
