'use server';

import db from '../db';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function registerUser(formData: FormData) {
  const userId = formData.get('user_id') as string;
  const password = formData.get('password') as string;

  const hashedPassword = await bcrypt.hash(password, 10);

  await new Promise<void>((resolve, reject) => {
    db.query(
      'INSERT INTO users (user_id, password, updated_at) VALUES (?, ?, NOW())',
      [userId, hashedPassword],
      (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });

  redirect('/login');
}

export async function loginUser(formData: FormData) {
  const userId = formData.get('user_id') as string;
  const password = formData.get('password') as string;

  const users = await new Promise<any[]>((resolve, reject) => {
    db.query('SELECT * FROM users WHERE user_id = ?', [userId], (err: any, results: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });

  if (users.length === 0) {
    redirect('/login?error=notfound');
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    redirect('/login?error=wrongpassword');
  }
 
  const cookieStore = await cookies();  
  cookieStore.set('userId', userId);

  redirect('/');
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  redirect('/');
}


export async function updateProfile(formData: FormData) {
  const userId = formData.get('user_id') as string;
  const email = formData.get('email') as string;
  const snsLink = formData.get('sns_link') as string;

  await new Promise<void>((resolve, reject) => {
    db.query(
      'UPDATE users SET email = ?, sns_link = ? WHERE user_id = ?',
      [email, snsLink, userId],
      (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });

  redirect('/user');
}

export async function createArticle(formData: FormData) {
  const userId = formData.get('user_id') as string;
  const title = formData.get('article_title') as string;
  const tag = formData.get('tag') as string;
  const content = formData.get('content') as string;
  const imageFile = formData.get('eyecatch_image') as File | null;

  let imagePath: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${imageFile.name}`;
    const filePath = path.join(process.cwd(), 'public', 'img', 'uploads', fileName);
    await writeFile(filePath, buffer);
    imagePath = `img/uploads/${fileName}`;
  }

  await new Promise<void>((resolve, reject) => {
    db.query(
      'INSERT INTO articles (article_title, content, tag, user_id, updated_at, eyecatch_image) VALUES (?, ?, ?, ?, NOW(), ?)',
      [title, content, tag, userId, imagePath],
      (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });

  redirect('/');
}

export async function updateArticle(formData: FormData) {
  const articleId = formData.get('article_id') as string;
  const title = formData.get('article_title') as string;
  const tag = formData.get('tag') as string;
  const content = formData.get('content') as string;
  const currentImage = formData.get('current_image') as string;
  const imageFile = formData.get('eyecatch_image') as File;

  let imagePath = currentImage;

  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${imageFile.name}`;
    const filePath = path.join(process.cwd(), 'public', 'img', 'uploads', fileName);
    await writeFile(filePath, buffer);
    imagePath = `img/uploads/${fileName}`;
  }

  await new Promise<void>((resolve, reject) => {
    db.query(
      'UPDATE articles SET article_title = ?, tag = ?, content = ?, eyecatch_image = ?, updated_at = NOW() WHERE article_id = ?',
      [title, tag, content, imagePath, articleId],
      (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });

  redirect(`/detail/${articleId}`);
}

export async function deleteArticle(formData: FormData) {
  const articleId = formData.get('article_id') as string;
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  await new Promise<void>((resolve, reject) => {
    db.query(
      'DELETE FROM articles WHERE article_id = ? AND user_id = ?',
      [articleId, userId],
      (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });

  redirect('/');
}