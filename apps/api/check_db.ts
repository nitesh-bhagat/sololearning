import { PrismaClient } from '@sololearning/db';

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    include: { chapters: true },
  });
  for (const course of courses) {
    console.log(course.id, course.title, course.chapters.length);
  }
}

main().finally(() => prisma.$disconnect());
