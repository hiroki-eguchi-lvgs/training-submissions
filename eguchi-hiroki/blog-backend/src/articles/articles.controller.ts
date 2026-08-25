import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticleDto } from './dto/article.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { articlesQuerySchema } from './schemas/articles-query.schema';
import type { ArticlesQuery } from './schemas/articles-query.schema';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(articlesQuerySchema))
  findAll(@Query() query: ArticlesQuery): Promise<ArticleDto[]> {
    return this.articlesService.findAll(query);
  }
}
