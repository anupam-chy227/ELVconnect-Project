import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type ELVCategory =
  | 'cctv'
  | 'access_control'
  | 'fire_alarm'
  | 'structured_cabling'
  | 'pa_system'
  | 'bms'
  | 'intercom'
  | 'gate_automation'
  | 'av_integration'
  | 'other';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'customer' | 'service_provider' | 'admin';
  profile: {
    fullName: string;
    companyName?: string;
    phone: string;
    avatar?: string;
    bio?: string;
  };
  businessDetails: {
    trn?: string;
    licenseNumber?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankIBAN?: string;
    bankSwiftCode?: string;
  };
  serviceProvider?: {
    specializations: ELVCategory[];
    yearsOfExperience: number;
    certifications: string[];
    serviceArea: { city: string; country: string };
    location: { type: 'Point'; coordinates: [number, number] };
    serviceRadius: number;
    isVerified: boolean;
    verifiedAt?: Date;
    averageRating: number;
    totalReviews: number;
    totalJobsCompleted: number;
  };
  customer?: {
    industry: string;
    totalInvoicesReceived: number;
    totalAmountPaid: number;
  };
  subscription: {
    plan: 'free' | 'pro' | 'business';
    status: 'active' | 'inactive' | 'cancelled';
    expiresAt?: Date;
    invoicesThisMonth: number;
  };
  refreshTokens: Array<{
    tokenHash: string;
    createdAt: Date;
    expiresAt: Date;
    deviceInfo?: string;
  }>;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
}

const ELV_CATEGORIES: ELVCategory[] = [
  'cctv', 'access_control', 'fire_alarm', 'structured_cabling',
  'pa_system', 'bms', 'intercom', 'gate_automation', 'av_integration', 'other',
];

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['customer', 'service_provider', 'admin'],
      required: true,
    },

    profile: {
      fullName: { type: String, required: true, trim: true },
      companyName: { type: String, trim: true },
      phone: { type: String, required: true },
      avatar: String,
      bio: String,
    },

    businessDetails: {
      trn: String,
      licenseNumber: String,
      bankName: String,
      bankAccountNumber: String, // AES-256-GCM encrypted
      bankIBAN: String,          // AES-256-GCM encrypted
      bankSwiftCode: String,
    },

    serviceProvider: {
      specializations: [{ type: String, enum: ELV_CATEGORIES }],
      yearsOfExperience: { type: Number, default: 0 },
      certifications: [String],
      serviceArea: {
        city: String,
        country: String,
      },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
      serviceRadius: { type: Number, default: 25 },
      isVerified: { type: Boolean, default: false },
      verifiedAt: Date,
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
      totalJobsCompleted: { type: Number, default: 0 },
    },

    customer: {
      industry: String,
      totalInvoicesReceived: { type: Number, default: 0 },
      totalAmountPaid: { type: Number, default: 0 },
    },

    subscription: {
      plan: { type: String, enum: ['free', 'pro', 'business'], default: 'free' },
      status: { type: String, enum: ['active', 'inactive', 'cancelled'], default: 'active' },
      expiresAt: Date,
      invoicesThisMonth: { type: Number, default: 0 },
    },

    refreshTokens: [
      {
        tokenHash: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
        deviceInfo: String,
      },
    ],

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ isDeleted: 1 });
userSchema.index({ 'serviceProvider.location': '2dsphere' });
userSchema.index({ 'serviceProvider.isVerified': 1 });
userSchema.index({ 'serviceProvider.specializations': 1 });

// ── Pre-save: hash password ───────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Methods ───────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// ── Soft-delete query filter ──────────────────────────────────────────────
userSchema.pre(/^find/, function (this: any) {
  if (!this.getQuery().isDeleted) {
    this.where({ isDeleted: false });
  }
});

export const User = mongoose.model<IUser>('User', userSchema);
