import express from 'express';
import { prisma } from '@sololearning/db';
import { requireAuth, AuthRequest } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * Send a friend request
 * POST /api/friends/request/:username
 */
router.post('/request/:username', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { username } = req.params;

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.id === userId) {
      return res.status(400).json({ error: 'Cannot send a friend request to yourself' });
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId: targetUser.id },
          { userId: targetUser.id, friendId: userId },
        ],
      },
    });

    if (existingFriendship) {
      return res.status(400).json({ error: 'Friendship or request already exists' });
    }

    // Create pending friendship
    // Direction: userId is the requester, friendId is the receiver
    const friendship = await prisma.friendship.create({
      data: {
        userId,
        friendId: targetUser.id,
        status: 'PENDING',
      },
    });

    res.json({ success: true, friendship });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Accept a friend request
 * POST /api/friends/accept/:friendshipId
 */
router.post('/accept/:friendshipId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { friendshipId } = req.params;

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Ensure the current user is the receiver of the request
    if (friendship.friendId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to accept this request' });
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' },
    });

    res.json({ success: true, friendship: updatedFriendship });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get friends and pending requests
 * GET /api/friends
 */
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    // Fetch all friendships involving the user
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
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

    // Format the response
    const friends = friendships
      .filter((f) => f.status === 'ACCEPTED')
      .map((f) => (f.userId === userId ? f.friend : f.user));

    const pendingReceived = friendships
      .filter((f) => f.status === 'PENDING' && f.friendId === userId)
      .map((f) => ({ id: f.id, user: f.user }));

    const pendingSent = friendships
      .filter((f) => f.status === 'PENDING' && f.userId === userId)
      .map((f) => ({ id: f.id, user: f.friend }));

    res.json({ friends, pendingReceived, pendingSent });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Search users by username (excluding self)
 * GET /api/friends/search?q=...
 */
router.get('/search', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim() === '') {
      return res.json([]);
    }

    // Find users whose username matches the query, excluding current user
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q,
          mode: 'insensitive',
        },
        NOT: {
          id: userId,
        },
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        rank: true,
        xp: true,
        streak: true,
      },
      take: 10,
    });

    if (users.length === 0) {
      return res.json([]);
    }

    // Check relationship status for each user
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId, friendId: { in: users.map((u) => u.id) } },
          { userId: { in: users.map((u) => u.id) }, friendId: userId },
        ],
      },
    });

    const usersWithStatus = users.map((u) => {
      const friendship = friendships.find(
        (f) =>
          (f.userId === userId && f.friendId === u.id) ||
          (f.userId === u.id && f.friendId === userId),
      );

      let status = 'none'; // none, pending_sent, pending_received, friends
      if (friendship) {
        if (friendship.status === 'ACCEPTED') {
          status = 'friends';
        } else if (friendship.status === 'PENDING') {
          if (friendship.userId === userId) {
            status = 'pending_sent';
          } else {
            status = 'pending_received';
          }
        }
      }

      return {
        ...u,
        friendshipStatus: status,
        friendshipId: friendship?.id || null,
      };
    });

    res.json(usersWithStatus);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Decline a friend request
 * POST /api/friends/decline/:friendshipId
 */
router.post('/decline/:friendshipId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { friendshipId } = req.params;

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Ensure the current user is the receiver of the request
    if (friendship.friendId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to decline this request' });
    }

    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    res.json({ success: true, message: 'Friend request declined' });
  } catch (error) {
    console.error('Error declining friend request:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Remove a friend or cancel/decline a request by user ID
 * POST /api/friends/remove/:friendId
 */
router.post('/remove/:friendId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { friendId } = req.params;

    // Find if any friendship exists between these two users
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'Friendship or request not found' });
    }

    await prisma.friendship.delete({
      where: { id: friendship.id },
    });
    res.json({ success: true, message: 'Friendship or request removed' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get friend activities
 * GET /api/friends/activities
 */
router.get('/activities', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    // Find all accepted friendships
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
        status: 'ACCEPTED',
      },
    });

    const friendIds = friendships.map((f) => (f.userId === userId ? f.friendId : f.userId));

    if (friendIds.length === 0) {
      return res.json([]);
    }

    const activities = await prisma.activity.findMany({
      where: {
        userId: { in: friendIds },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            rank: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching friend activities:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get friends course progress (active topic positions)
 * GET /api/friends/progress/:courseId
 */
router.get('/progress/:courseId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { courseId } = req.params;

    // Find all accepted friendships
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
        status: 'ACCEPTED',
      },
    });

    const friendIds = friendships.map((f) => (f.userId === userId ? f.friendId : f.userId));

    if (friendIds.length === 0) {
      return res.json([]);
    }

    // Fetch user progress for friends in this course
    const progress = await prisma.userProgress.findMany({
      where: {
        userId: { in: friendIds },
        topic: {
          chapter: {
            courseId: courseId,
          },
        },
      },
      include: {
        topic: {
          select: {
            id: true,
            order: true,
            chapter: {
              select: {
                order: true,
              },
            },
          },
        },
      },
    });

    const friends = await prisma.user.findMany({
      where: { id: { in: friendIds } },
      select: { id: true, username: true, avatar: true },
    });

    const results = friends
      .map((friend) => {
        const friendProgress = progress.filter((p) => p.userId === friend.id);

        if (friendProgress.length === 0) {
          return null; // Has not started the course
        }

        // Find highest unlocked but not completed
        const activeNodes = friendProgress.filter((p) => p.isUnlocked && !p.isCompleted);

        let activeProgress = null;
        if (activeNodes.length > 0) {
          // Sort by chapter.order desc, topic.order desc
          activeNodes.sort((a, b) => {
            const chapDiff = b.topic.chapter.order - a.topic.chapter.order;
            if (chapDiff !== 0) return chapDiff;
            return b.topic.order - a.topic.order;
          });
          activeProgress = activeNodes[0];
        } else {
          // Find highest completed
          const completedNodes = friendProgress.filter((p) => p.isCompleted);
          if (completedNodes.length > 0) {
            completedNodes.sort((a, b) => {
              const chapDiff = b.topic.chapter.order - a.topic.chapter.order;
              if (chapDiff !== 0) return chapDiff;
              return b.topic.order - a.topic.order;
            });
            activeProgress = completedNodes[0];
          }
        }

        if (!activeProgress) {
          return null;
        }

        return {
          id: friend.id,
          username: friend.username,
          avatar: friend.avatar,
          activeTopicId: activeProgress.topicId,
        };
      })
      .filter(Boolean);

    res.json(results);
  } catch (error) {
    console.error('Error fetching friends progress:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
