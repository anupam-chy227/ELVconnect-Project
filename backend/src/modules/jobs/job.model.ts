import mongoose, { Document, Schema, Types } from 'mongoose';
import { ELVCategory } from '../users/user.model';

type JobStatus = 'draft' | 'open' | 'applications_received' | 'in_progress' | 'completed' | 'cancelled';

export interface IJob extends Document {
  customerId: Types.ObjectId;
  title: string;
  description: string;
  category: ELVCategory[];
  status: JobStatus;
  visibility: 'public' | 'invite_only';
  budget: {
    type: 'fixed' | 'range' | 'get_quotes';
    min?: number;
    max?: number;
    currency: string;
  };
  location: {
    address: string;
    city: string;
    country: string;
    type: 'Point';
    coordinates: [number, number];
  };
  timeline: {
    startDate?: Date;
    deadline?: Date;
  };
  attachments: Array<{
    url: string;
    filename: string;
    type: string;
  }>;
  applications: Array<{
    serviceProviderId: Types.ObjectId;
    appliedAt: Date;
    coverNote?: string;
    proposedAmount?: number;
    status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
  }>;
  assignedTo?: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    category: [
      {
        type: String,
        enum: ['cctv','access_control','fire_alarm','structured_cabling','pa_system',
               'bms','intercom','gate_automation','av_integration','other'],
      },
    ],
    status: {
      type: String,
      enum: ['draft','open','applications_received','in_progress','completed','cancelled'],
      default: 'draft',
    },
    visibility: { type: String, enum: ['public', 'invite_only'], default: 'public' },
    budget: {
      type: { type: String, enum: ['fixed', 'range', 'get_quotes'], required: true },
      min: Number,
      max: Number,
      currency: { type: String, default: 'AED' },
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: 'UAE' },
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    timeline: {
      startDate: Date,
      deadline: Date,
    },
    attachments: [
      {
        url: { type: String, required: true },
        filename: String,
        type: String,
      },
    ],
    applications: [
      {
        serviceProviderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        appliedAt: { type: Date, default: Date.now },
        coverNote: { type: String, maxlength: 1000 },
        proposedAmount: Number,
        status: {
          type: String,
          enum: ['pending', 'shortlisted', 'accepted', 'rejected'],
          default: 'pending',
        },
      },
    ],
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────
jobSchema.index({ 'location': '2dsphere' });
jobSchema.index({ status: 1, visibility: 1 });
jobSchema.index({ customerId: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ isDeleted: 1 });

// ── Soft-delete filter ────────────────────────────────────────────────────
jobSchema.pre(/^find/, function (this: any) {
  if (!this.getQuery().isDeleted) this.where({ isDeleted: false });
});

export const Job = mongoose.model<IJob>('Job', jobSchema);
