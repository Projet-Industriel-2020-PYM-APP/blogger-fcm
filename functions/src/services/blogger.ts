import fetch from 'node-fetch';
import { Blog } from '../models/blog';
import { Post } from '../models/post';

export abstract class Blogger {
  abstract fetchBlog(): Promise<Blog>;
  abstract fetchLatestPost(): Promise<Post>;
}

export class BloggerImpl implements Blogger {
  constructor(private blogID: string, private key: string) {}

  async fetchBlog(): Promise<Blog> {
    const response = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${this.blogID}?key=${this.key}`
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data;
  }

  async fetchLatestPost(): Promise<Post> {
    const response = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${this.blogID}/posts?key=${this.key}`
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data: Post[] = (await response.json())['items'];
    return data[0];
  }
}
