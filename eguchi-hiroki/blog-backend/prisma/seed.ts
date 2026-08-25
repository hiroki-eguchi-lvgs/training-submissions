import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'root',
  database: 'blog_app',
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();

  const tanaka = await prisma.user.create({
    data: {
      user_id: 'tanaka',
      password: '$2b$10$erI1Au6hhXnkruT.R0rjy.P858E4r4G/wGhaHRwHUCtW6LlUpsgpu',
      email: 'tanaka@example.com',
      updated_at: new Date(),
    },
  });

  const suzuki = await prisma.user.create({
    data: {
      user_id: 'suzuki',
      password: '$2b$10$mKm/UYUZpH.7CojubpJV1eX1kNkZgo7I0DpHS19CyukKrMYfvQna6',
      email: 'suzuki@example.com',
      updated_at: new Date(),
    },
  });

  await prisma.article.create({
    data: {
      article_title: 'ハワイ旅行記',
      content: 'ハワイに行ってきました。ビーチがとても綺麗で、最高の休暇を過ごせました。また訪れたいと思います。',
      tag: '旅行',
      user_id: tanaka.user_id,
      updated_at: new Date(),
    },
  });

  await prisma.article.create({
    data: {
      article_title: '京都グルメ紀行',
      content: '京都で美味しいものをたくさん食べました。特に湯豆腐が印象的でした。次は紅葉の季節に行きたいです。',
      tag: 'グルメ',
      user_id: tanaka.user_id,
      updated_at: new Date(),
    },
  });

  await prisma.article.create({
    data: {
      article_title: '北海道スキー旅行',
      content: '冬の北海道でスキーを楽しみました。雪質が素晴らしく、初心者でも滑りやすいゲレンデでした。',
      tag: '旅行',
      user_id: suzuki.user_id,
      updated_at: new Date(),
    },
  });

  await prisma.article.create({
    data: {
      article_title: '沖縄ダイビング体験',
      content: '沖縄の海でダイビングをしてきました。透明度が高く、たくさんの魚を見ることができました。',
      tag: 'アクティビティ',
      user_id: suzuki.user_id,
      updated_at: new Date(),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
