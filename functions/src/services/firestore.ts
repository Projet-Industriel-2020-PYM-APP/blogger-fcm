export abstract class FirestoreService {
  abstract getTotalItems(): Promise<number>;
  abstract postTotalItems(totalItems: number): Promise<FirebaseFirestore.WriteResult>;
}

export class FirestoreServiceImpl implements FirestoreService {
  constructor(private firestore: FirebaseFirestore.Firestore, private collection: string) {}

  async getTotalItems(): Promise<number> {
    const doc = await this.firestore.doc(`${this.collection}/0`).get();

    if (!doc.exists) {
      throw new Error(`Document not found : ${this.collection}/0`);
    } else {
      return doc.data()?.totalItems;
    }
  }

  postTotalItems(totalItems: number): Promise<FirebaseFirestore.WriteResult> {
    return this.firestore.doc(`${this.collection}/0`).set({
      totalItems: totalItems,
    });
  }
}
