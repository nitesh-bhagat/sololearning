import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { prisma } from '@sololearning/db';
import { cacheMiddleware } from '../middlewares/cache.middleware';

const router = Router();

// PUT /api/users/profile
// Update user profile fields (like avatar)
router.put('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const { avatar } = req.body;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).userId;

    if (!avatar) {
      return res.status(400).json({ error: 'No data to update' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        xp: true,
        streak: true,
        rank: true,
        badges: true,
      },
    });

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});
// GET /api/users/:username
// Get user profile by username
router.get('/:username', requireAuth, async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentUserId = (req as any).userId;

    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        avatar: true,
        xp: true,
        streak: true,
        rank: true,
        badges: true,
      },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check friendship status
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: currentUserId, friendId: targetUser.id },
          { userId: targetUser.id, friendId: currentUserId },
        ],
      },
    });

    let friendshipStatus = 'none';
    if (friendship) {
      if (friendship.status === 'ACCEPTED') {
        friendshipStatus = 'friends';
      } else if (friendship.status === 'PENDING') {
        friendshipStatus =
          friendship.userId === currentUserId ? 'pending_sent' : 'pending_received';
      }
    }

    // Dummy counts for followers and following since it's symmetric in this app (or we can just query it)
    const followersCount = await prisma.friendship.count({
      where: { friendId: targetUser.id, status: 'ACCEPTED' },
    });
    const followingCount = await prisma.friendship.count({
      where: { userId: targetUser.id, status: 'ACCEPTED' },
    });

    res.json({
      ...targetUser,
      friendshipStatus,
      friendshipId: friendship?.id || null,
      followersCount,
      followingCount,
      bio: 'Lifelong learner, coding enthusiast. Always ready for a challenge!', // Dummy bio
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/users/:username/friends
// Get friends of a specific user
router.get('/:username/friends', requireAuth, async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userId: targetUser.id }, { friendId: targetUser.id }],
        status: 'ACCEPTED',
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, rank: true, xp: true, streak: true },
        },
        friend: {
          select: { id: true, username: true, avatar: true, rank: true, xp: true, streak: true },
        },
      },
    });

    const friends = friendships.map((f) => (f.userId === targetUser.id ? f.friend : f.user));

    res.json({ friends });
  } catch (error) {
    console.error('Error fetching user friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});
// GET /api/users/leaderboard
// Returns top 10 users ranked by XP
router.get(
  '/leaderboard',
  cacheMiddleware(300, 'leaderboard:'),
  async (req: Request, res: Response) => {
    try {
      const topUsers = await prisma.user.findMany({
        take: 10,
        orderBy: {
          xp: 'desc',
        },
        select: {
          id: true,
          username: true,
          avatar: true,
          xp: true,
          rank: true,
          streak: true,
        },
      });

      res.json(topUsers);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  },
);

export { router as usersRouter };
