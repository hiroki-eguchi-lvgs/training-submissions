import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mysql from 'mysql2/promise';
import { ArticleDto } from './dto/article.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly configService: ConfigService) {}

  async findAll(): Promise<ArticleDto[]> {
    const connection = await mysql.createConnection({
      host: this.configService.get<string>('DB_HOST'),
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      port: this.configService.get<number>('DB_PORT'),
    });

    const [rows] = await connection.query('SELECT * FROM articles ORDER BY updated_at DESC');
    await connection.end();

    return rows as ArticleDto[];
  }
}
