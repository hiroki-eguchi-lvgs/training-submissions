import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let service: ArticlesService;

  const mockArticlesService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        { provide: ArticlesService, useValue: mockArticlesService },
      ],
    }).compile();
    controller = module.get<ArticlesController>(ArticlesController);
    service = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllは、serviceのfindAllを呼び、その結果をそのまま返す', async () => {
    const mockArticles = [
      {
        article_id: 1,
        article_title: 'テスト記事',
        content: 'テスト本文',
        tag: null,
        user_id: 'tanaka',
        updated_at: new Date(),
        eyecatch_image: null,
      },
    ];
    mockArticlesService.findAll.mockResolvedValue(mockArticles);

    const query = { limit: 10, offset: 0 };
    const result = await controller.findAll(query);

    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual(mockArticles);
  });
});
