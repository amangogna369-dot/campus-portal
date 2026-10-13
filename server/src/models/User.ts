import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'student' | 'user' | 'faculty' | 'admin';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  studentFacultyId?: string;
  department?: string;
  course?: string;
  year?: string;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  toSafeObject(): Record<string, any>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: ['student', 'user', 'faculty', 'admin'],
      default: 'student',
    },
    studentFacultyId: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: 'General Academics',
    },
    course: {
      type: String,
      trim: true,
      default: 'Undergraduate',
    },
    year: {
      type: String,
      default: '1st Year',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'users',
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : '';
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : '';
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Method to return safe user object without passwordHash
UserSchema.methods.toSafeObject = function (): Record<string, any> {
  const userObj = this.toObject();
  const { passwordHash, _id, __v, ...safeUser } = userObj;
  return {
    id: _id ? _id.toString() : this.id,
    _id: _id ? _id.toString() : this.id,
    ...safeUser,
  };
};

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
