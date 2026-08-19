import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticlesService {
  findAll() {
    return [
      {
        article_id: 1,
        article_title: 'ハワイ旅行記',
        content: 'ハワイに行ってきました。ビーチがとても綺麗で、最高の休暇を過ごせました。',
        tag: '旅行',
        user_id: 'tanaka',
        updated_at: new Date(),
        eyecatch_image: undefined,
      },
      {
        article_id: 2,
        article_title: '京都グルメ紀行',
        content: '京都で美味しいものをたくさん食べました。特に湯豆腐が印象的でした。',
        tag: 'グルメ',
        user_id: 'tanaka',
        updated_at: new Date(),
        eyecatch_image: undefined,
      },
    ];
  }
}