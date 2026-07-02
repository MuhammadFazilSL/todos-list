import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private db: admin.firestore.Firestore;
  private bucket: any; // Reference to GCS bucket

  onModuleInit() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '')
      : undefined;

    const isDummy = !projectId || !clientEmail || !privateKey || projectId.includes('dummy');

    if (isDummy) {
      this.logger.warn(
        'Firebase credentials not fully configured or using dummy values. Running in OFFLINE MOCK MODE with local repositories.',
      );
      this.db = null as any;
      this.bucket = null as any;
      return;
    }

    try {
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          storageBucket: process.env.GCS_BUCKET_NAME || `${projectId}.appspot.com`,
        });
      }
      this.logger.log('Firebase Admin SDK initialized successfully.');
      this.db = admin.firestore();
      this.bucket = admin.storage().bucket();
    } catch (error) {
      this.logger.error('Error initializing Firebase Admin SDK:', error.stack);
      this.db = null as any;
      this.bucket = null as any;
    }
  }

  get firestore(): admin.firestore.Firestore {
    return this.db;
  }

  get storageBucket() {
    return this.bucket;
  }
}
