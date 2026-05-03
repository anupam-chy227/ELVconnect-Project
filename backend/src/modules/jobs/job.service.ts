import { Job } from './job.model';
import { User } from '../users/user.model';
import { CreateJobInput } from './job.schema';
import { Types } from 'mongoose';

// ── Create Job ────────────────────────────────────────────────────────────
export const createJob = async (customerId: string, data: CreateJobInput) => {
  const job = await Job.create({
    customerId: new Types.ObjectId(customerId),
    title: data.title,
    description: data.description,
    category: data.category,
    visibility: data.visibility,
    budget: data.budget,
    location: {
      ...data.location,
      type: 'Point',
    },
    timeline: data.timeline,
    status: 'open',
  });
  return job;
};

// ── List Jobs (public — with geo filter) ──────────────────────────────────
export const listJobs = async (query: {
  lat?: string;
  lng?: string;
  radius?: string;
  city?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const filter: any = { visibility: 'public' };
  if (query.status) filter.status = query.status;
  else filter.status = 'open';
  if (query.category) filter.category = query.category;
  if (query.city && query.city !== 'All India') {
    filter.$or = [
      { 'location.city': new RegExp(query.city, 'i') },
      { 'location.address': new RegExp(query.city, 'i') },
      { 'location.country': new RegExp(query.city, 'i') },
    ];
  }

  const page = query.page || 1;
  const limit = Math.min(query.limit || 20, 50);
  const skip = (page - 1) * limit;

  // Geo query
  if (query.lat && query.lng) {
    const radiusKm = parseFloat(query.radius || '25');
    const [data, total] = await Promise.all([
      Job.find({
        ...filter,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(query.lng), parseFloat(query.lat)],
            },
            $maxDistance: radiusKm * 1000, // metres
          },
        },
      }).skip(skip).limit(limit).populate('customerId', 'profile.fullName profile.companyName'),
      Job.countDocuments(filter),
    ]);
    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  const [data, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'profile.fullName profile.companyName'),
    Job.countDocuments(filter),
  ]);

  return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

// ── Get Single Job ────────────────────────────────────────────────────────
export const getJob = async (jobId: string) => {
  const job = await Job.findById(jobId)
    .populate('customerId', 'profile.fullName profile.companyName profile.avatar')
    .populate('assignedTo', 'profile.fullName profile.companyName serviceProvider.averageRating');
  if (!job) throw Object.assign(new Error('Job not found'), { statusCode: 404, code: 'NOT_FOUND' });
  return job;
};

// ── Apply to Job (service provider) ──────────────────────────────────────
export const applyToJob = async (
  jobId: string,
  serviceProviderId: string,
  data: { coverNote?: string; proposedAmount?: number }
) => {
  const job = await Job.findById(jobId);
  if (!job) throw Object.assign(new Error('Job not found'), { statusCode: 404, code: 'NOT_FOUND' });
  if (job.status !== 'open') throw Object.assign(new Error('Job is no longer accepting applications'), { statusCode: 400, code: 'INVALID_REQUEST' });

  // Prevent duplicate applications
  const alreadyApplied = job.applications.some(
    (app) => app.serviceProviderId.toString() === serviceProviderId
  );
  if (alreadyApplied) throw Object.assign(new Error('You have already applied to this job'), { statusCode: 409, code: 'CONFLICT' });

  job.applications.push({
    serviceProviderId: new Types.ObjectId(serviceProviderId),
    appliedAt: new Date(),
    coverNote: data.coverNote,
    proposedAmount: data.proposedAmount,
    status: 'pending',
  });

  if (job.status === 'open') job.status = 'applications_received';

  await job.save();
  return job;
};

// ── Update Application Status (customer only) ─────────────────────────────
export const updateApplicationStatus = async (
  jobId: string,
  customerId: string,
  applicationId: string,
  status: 'shortlisted' | 'accepted' | 'rejected'
) => {
  const job = await Job.findOne({ _id: new Types.ObjectId(jobId), customerId: new Types.ObjectId(customerId) });
  if (!job) throw Object.assign(new Error('Job not found'), { statusCode: 404, code: 'NOT_FOUND' });

  const app = job.applications.find((a) => a.serviceProviderId.toString() === applicationId);
  if (!app) throw Object.assign(new Error('Application not found'), { statusCode: 404, code: 'NOT_FOUND' });

  app.status = status;
  if (status === 'accepted') {
    job.assignedTo = new Types.ObjectId(applicationId);
    job.status = 'in_progress';
    // Reject all other applications
    job.applications.forEach((a) => {
      if (a.serviceProviderId.toString() !== applicationId) a.status = 'rejected';
    });
  }

  await job.save();
  return job;
};

// ── My Jobs (customer's posted jobs) ─────────────────────────────────────
export const myJobs = async (customerId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Job.find({ customerId: new Types.ObjectId(customerId) }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments({ customerId: new Types.ObjectId(customerId) }),
  ]);
  return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

// ── Engineers' nearby jobs ────────────────────────────────────────────────
export const nearbyJobs = async (serviceProviderId: string, radius = 25) => {
  const user = await User.findById(serviceProviderId);
  if (!user?.serviceProvider?.location?.coordinates) {
    throw Object.assign(new Error('Location not set on your profile'), { statusCode: 400, code: 'INVALID_REQUEST' });
  }

  const [lng, lat] = user.serviceProvider.location.coordinates;
  const data = await Job.find({
    status: 'open',
    visibility: 'public',
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radius * 1000,
      },
    },
  }).limit(50);

  return data;
};

// ── Delete Job (soft delete) ──────────────────────────────────────────────
export const deleteJob = async (jobId: string, customerId: string) => {
  const job = await Job.findOne({ _id: new Types.ObjectId(jobId), customerId: new Types.ObjectId(customerId) });
  if (!job) throw Object.assign(new Error('Job not found'), { statusCode: 404, code: 'NOT_FOUND' });

  job.isDeleted = true;
  await job.save();
  return { message: 'Job deleted successfully' };
};
