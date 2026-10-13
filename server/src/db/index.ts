import fs from 'fs';
import path from 'path';
import {
  IUser,
  IArticle,
  ICategory,
  IEvent,
  IAnnouncement,
  IInterview,
  IComment,
  ILike,
  IBookmark,
  INotification,
  IContactMessage,
  INewsletterSubscriber,
  IActivityLog,
} from './schemaTypes.js';
import { getSeedData } from './seedData.js';

interface DatabaseSchema {
  users: IUser[];
  categories: ICategory[];
  articles: IArticle[];
  events: IEvent[];
  announcements: IAnnouncement[];
  interviews: IInterview[];
  comments: IComment[];
  likes: ILike[];
  bookmarks: IBookmark[];
  notifications: INotification[];
  contactMessages: IContactMessage[];
  newsletterSubscribers: INewsletterSubscriber[];
  activityLogs: IActivityLog[];
}

class DatabaseManager {
  private dataDir = path.resolve(process.cwd(), 'data');
  private dbFilePath = path.resolve(process.cwd(), 'data', 'campus_db.json');
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadDatabase();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
      } catch (err) {
        console.error('Could not create data directory:', err);
      }
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(this.dbFilePath)) {
      try {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.articles && parsed.categories) {
          return parsed;
        }
      } catch (err) {
        console.warn('Error reading existing database file, re-initializing with seed data:', err);
      }
    }
    const seed = getSeedData();
    this.saveImmediate(seed);
    return seed;
  }

  private saveImmediate(snapshot: DatabaseSchema) {
    try {
      this.ensureDataDirectory();
      fs.writeFileSync(this.dbFilePath, JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveImmediate(this.data);
    }, 100);
  }

  public resetToSeed(): DatabaseSchema {
    const seed = getSeedData();
    this.data = seed;
    this.saveImmediate(seed);
    return this.data;
  }

  // Collection Accessors
  public get users() { return this.data.users; }
  public get categories() { return this.data.categories; }
  public get articles() { return this.data.articles; }
  public get events() { return this.data.events; }
  public get announcements() { return this.data.announcements; }
  public get interviews() { return this.data.interviews; }
  public get comments() { return this.data.comments; }
  public get likes() { return this.data.likes; }
  public get bookmarks() { return this.data.bookmarks; }
  public get notifications() { return this.data.notifications; }
  public get contactMessages() { return this.data.contactMessages; }
  public get newsletterSubscribers() { return this.data.newsletterSubscribers; }
  public get activityLogs() { return this.data.activityLogs; }

  // Activity logger helper
  public logActivity(action: string, userName: string, details: string, userId?: string, entityType?: IActivityLog['entityType'], entityId?: string) {
    const log: IActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      action,
      userId,
      userName,
      details,
      entityType,
      entityId,
      createdAt: new Date().toISOString(),
    };
    this.data.activityLogs.unshift(log);
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs.pop();
    }
    this.save();
    return log;
  }

  // Notification helper
  public createNotification(userId: string, title: string, message: string, type: INotification['type'], link?: string) {
    const notif: INotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      title,
      message,
      type,
      link,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }
}

export const db = new DatabaseManager();
