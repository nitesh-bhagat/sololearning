import { PrismaClient } from '@sololearning/db';

const prisma = new PrismaClient();

async function main() {
  const courseId = 'python-beginners-course';

  // 1. Find the first user (assume it's the current user)
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  if (users.length === 0) {
    console.log('No users found. Start the frontend to create a default user first.');
    return;
  }
  const mainUser = users[0];

  // 2. Create a fake friend if they don't exist
  let friend = await prisma.user.findUnique({ where: { username: 'AlexTheGreat' } });
  if (!friend) {
    friend = await prisma.user.create({
      data: {
        username: 'AlexTheGreat',
        email: 'alex@example.com',
        avatar: 'A',
        passwordHash: 'dummyhash123',
      },
    });
  }

  // 3. Establish Friendship
  const friendshipExists = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: mainUser.id, friendId: friend.id },
        { userId: friend.id, friendId: mainUser.id },
      ],
    },
  });

  if (!friendshipExists) {
    await prisma.friendship.create({
      data: {
        userId: mainUser.id,
        friendId: friend.id,
        status: 'ACCEPTED',
      },
    });
  }

  // 4. Enroll friend in course
  const enrollmentExists = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId: friend.id,
        courseId: courseId,
      },
    },
  });

  if (!enrollmentExists) {
    await prisma.courseEnrollment.create({
      data: {
        userId: friend.id,
        courseId: courseId,
      },
    });
    console.log(`Successfully enrolled AlexTheGreat in ${courseId}`);
  } else {
    console.log(`AlexTheGreat is already enrolled in ${courseId}`);
  }

  console.log('Friend seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding friend:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
