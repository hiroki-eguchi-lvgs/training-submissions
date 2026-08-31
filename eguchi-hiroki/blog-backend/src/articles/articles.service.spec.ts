import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { ArticlesRepository } from './articles.repository';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let repository: ArticlesRepository;

  const mockArticlesRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: ArticlesRepository, useValue: mockArticlesRepository },
      ],
    }).compile();
    service = module.get<ArticlesService>(ArticlesService);
    repository = module.get<ArticlesRepository>(ArticlesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAllは、repositoryのfindAllを呼び、その結果をそのまま返す', async () => {
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
    mockArticlesRepository.findAll.mockResolvedValue(mockArticles);

    const query = { limit: 10, offset: 0 };
    const result = await service.findAll(query);

    expect(repository.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual(mockArticles);
  });
});