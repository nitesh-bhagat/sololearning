import { PrismaClient } from '@sololearning/db';
import { MOCK_COURSE_DATA_PYTHON } from '../web/app/(app)/course/[course_id]/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB seed with MOCK_COURSE_DATA_PYTHON...');

  // 1. Create or find subject
  const subjectName = MOCK_COURSE_DATA_PYTHON.subject || 'Python Programming';
  let subjectRecord = await prisma.subject.findUnique({ where: { title: subjectName } });
  if (!subjectRecord) {
    subjectRecord = await prisma.subject.create({
      data: { title: subjectName, description: `Courses related to ${subjectName}` },
    });
  }

  // 2. Check if course already exists and delete it to reseed fresh
  const existingCourse = await prisma.course.findFirst({
    where: { title: MOCK_COURSE_DATA_PYTHON.title },
  });

  if (existingCourse) {
    console.log(`Course "${MOCK_COURSE_DATA_PYTHON.title}" already exists. Deleting to re-seed...`);
    await prisma.course.delete({ where: { id: existingCourse.id } });
  }

  // Calculate total XP
  const totalXp = MOCK_COURSE_DATA_PYTHON.chapters.reduce((total: number, ch: any) => {
    return total + ch.topics.reduce((tTotal: number, t: any) => tTotal + 50, 0); // Defaulting xpReward to 50
  }, 0);

  // 3. Create Course
  const course = await prisma.course.create({
    data: {
      id: MOCK_COURSE_DATA_PYTHON.id,
      title: MOCK_COURSE_DATA_PYTHON.title,
      description: MOCK_COURSE_DATA_PYTHON.description,
      totalXp,
      subjectId: subjectRecord.id,
      chapters: {
        create: MOCK_COURSE_DATA_PYTHON.chapters.map((ch: any, chIdx: number) => ({
          title: ch.title,
          order: chIdx + 1,
          topics: {
            create: ch.topics.map((t: any, tIdx: number) => ({
              title: t.title,
              order: tIdx + 1,
              xpReward: 50,
              content: t.content || [],
              excercise: t.excercise || [],
            })),
          },
        })),
      },
    },
  });

  console.log(`Seed completed successfully! Created course: ${course.title} (ID: ${course.id})`);
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
