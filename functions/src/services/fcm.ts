import { messaging } from 'firebase-admin';
import { Post } from '../models/post';

export abstract class FcmService {
  abstract notifyListeners(post: Post, topic: string): Promise<messaging.MessagingTopicResponse>;
}

export class FcmServiceImpl implements FcmService {
  constructor(private client: messaging.Messaging) {}

  notifyListeners(post: Post, topic: string): Promise<messaging.MessagingTopicResponse> {
    const payload = {
      notification: {
        title: 'Nouvelle article !',
        body: post.title ?? '',
      },
      data: {
        kind: post.kind ?? '',
        id: post.id ?? '',
        published: post.published ?? '',
        updated: post.updated ?? '',
        url: post.url ?? '',
        selfLink: post.selfLink ?? '',
        title: post.title ?? '',
        content: post.content ?? '',
      },
    };

    return this.client.sendToTopic(topic, payload);
  }
}
