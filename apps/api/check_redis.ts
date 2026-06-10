import { redisService } from './src/services/redis';

async function main() {
  const keys = await redisService.client.keys('*');
  console.log('All Redis Keys:', keys);

  // also explicitly invalidate
  await redisService.invalidatePattern('roadmap:*');
  await redisService.invalidatePattern('courses:*');
  console.log('Invalidated.');
}
main().finally(() => redisService.client.quit());
