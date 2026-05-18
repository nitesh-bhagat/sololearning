import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { prisma } from '@sololearning/db';

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

export { router as usersRouter };
