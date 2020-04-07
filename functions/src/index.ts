import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { BloggerImpl, Blogger } from './services/blogger';
import { FcmServiceImpl, FcmService } from './services/fcm';
import { FirestoreServiceImpl, FirestoreService } from './services/firestore';

admin.initializeApp();

const collection: string = functions.config().env.collection ?? 'COLLECTION_NAME_UNDEFINED';
if (collection === 'COLLECTION_NAME_UNDEFINED') {
  console.warn('Environment configuration COLLECTION_NAME is undefined.');
}
const blogID: string = functions.config().env.blog_id ?? 'BLOG_ID_UNDEFINED';
if (blogID === 'BLOG_ID_UNDEFINED') {
  console.warn('Environment configuration env.blog_id is undefined.');
}
const key: string = functions.config().env.blogger_api_key ?? 'BLOGGER_API_KEY_UNDEFINED';
if (key === 'BLOGGER_API_KEY_UNDEFINED') {
  console.warn('Environment configuration env.blogger_api_key is undefined.');
}
const topic: string = functions.config().env.topic ?? 'TOPIC_UNDEFINED';
if (topic === 'TOPIC_UNDEFINED') {
  console.warn('Environment configuration "env.topic" is undefined.');
}

const fcm = admin.messaging();
const firestore = admin.firestore();

const blogger: Blogger = new BloggerImpl(blogID, key);
const fcmService: FcmService = new FcmServiceImpl(fcm);
const firestoreService: FirestoreService = new FirestoreServiceImpl(firestore, collection);

export const bloggerNotifier = functions.https.onRequest(async (request, response) => {
  if (request.method === 'GET') {
    try {
      console.log('Fetching blog...');
      const blog = blogger.fetchBlog();
      console.log('Fetching saved items from Firestore...');
      const savedItems = firestoreService.getTotalItems();
      const totalItems = (await blog).posts?.totalItems ?? -1;
      if (totalItems !== (await savedItems)) {
        console.log('New posts !');
        const promises: Promise<any>[] = [];

        console.log('Refreshing saved items from Firestore...');
        promises.push(
          firestoreService
            .postTotalItems(totalItems)
            .then(() => console.log('Post to firestore done.'))
        );

        console.log('Fetch latest post...');
        const latest = await blogger.fetchLatestPost();
        console.log('Fetch latest post done.');

        console.log('Send notification...');
        promises.push(
          fcmService.notifyListeners(latest, topic).then(() => console.log('Notified.'))
        );

        await Promise.all(promises);
        response.status(200).send(
          `Notification sent !
Number of posts : ${totalItems}.
Latest post : ${JSON.stringify(latest)}`
        );
      } else {
        console.log('No new posts.');
        response.status(200).send(`No new posts.
Number of posts : ${totalItems}.`);
      }
    } catch (error) {
      console.error(error);
      response.status(500).send(error);
    }
  } else {
    response.status(400).send('GET is only accepted.');
  }
});
