import { User } from './user.model';
import { Types } from 'mongoose';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const LOCATION_ALIASES: Record<string, string[]> = {
  'Delhi NCR': ['Delhi NCR', 'Delhi', 'New Delhi', 'Gurugram', 'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad', 'Manesar'],
  Maharashtra: ['Maharashtra', 'Mumbai', 'Pune', 'Navi Mumbai', 'Thane', 'Nagpur', 'Chakan'],
  Karnataka: ['Karnataka', 'Bengaluru', 'Bangalore', 'Mysuru'],
  Telangana: ['Telangana', 'Hyderabad', 'Secunderabad'],
  Gujarat: ['Gujarat', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Tamil Nadu': ['Tamil Nadu', 'Chennai', 'Coimbatore', 'Madurai'],
  'West Bengal': ['West Bengal', 'Kolkata', 'Howrah'],
};

function getCityPatterns(city: string) {
  return (LOCATION_ALIASES[city] || [city]).map((alias) => new RegExp(escapeRegExp(alias), 'i'));
}

function toFiniteNumber(value: string | undefined) {
  if (value === undefined || value.trim() === '') {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

// ── Get Profile ───────────────────────────────────────────────────────────
export const getProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-refreshTokens -passwordResetToken -passwordResetExpires');
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'NOT_FOUND' });
  return user;
};

// ── Update Profile ────────────────────────────────────────────────────────
export const updateProfile = async (userId: string, updates: Record<string, any>) => {
  // Whitelist only safe fields
  const allowed = ['profile.fullName', 'profile.companyName', 'profile.phone', 'profile.bio', 'profile.avatar'];
  const safeUpdates: Record<string, any> = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) safeUpdates[key] = updates[key];
  }

  if (updates.profile && typeof updates.profile === 'object') {
    if (updates.profile.fullName !== undefined) safeUpdates['profile.fullName'] = updates.profile.fullName;
    if (updates.profile.companyName !== undefined) safeUpdates['profile.companyName'] = updates.profile.companyName;
    if (updates.profile.phone !== undefined) safeUpdates['profile.phone'] = updates.profile.phone;
    if (updates.profile.bio !== undefined) safeUpdates['profile.bio'] = updates.profile.bio;
    if (updates.profile.avatar !== undefined) safeUpdates['profile.avatar'] = updates.profile.avatar;
  }

  // Flat-field shorthand
  if (updates.fullName) safeUpdates['profile.fullName'] = updates.fullName;
  if (updates.companyName) safeUpdates['profile.companyName'] = updates.companyName;
  if (updates.phone) safeUpdates['profile.phone'] = updates.phone;
  if (updates.bio) safeUpdates['profile.bio'] = updates.bio;
  if (updates.avatar) safeUpdates['profile.avatar'] = updates.avatar;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: safeUpdates },
    { new: true, runValidators: true }
  ).select('-refreshTokens -passwordResetToken -passwordResetExpires');

  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'NOT_FOUND' });
  return user;
};

// ── Update Service Provider Details ──────────────────────────────────────
export const updateServiceProviderDetails = async (userId: string, updates: Record<string, any>) => {
  const allowed: Record<string, string> = {
    specializations: 'serviceProvider.specializations',
    yearsOfExperience: 'serviceProvider.yearsOfExperience',
    certifications: 'serviceProvider.certifications',
    serviceRadius: 'serviceProvider.serviceRadius',
    city: 'serviceProvider.serviceArea.city',
    country: 'serviceProvider.serviceArea.country',
    lat: 'serviceProvider.location.coordinates.1',
    lng: 'serviceProvider.location.coordinates.0',
  };

  const safeUpdates: Record<string, any> = {};
  for (const [key, path] of Object.entries(allowed)) {
    if (updates[key] !== undefined) safeUpdates[path] = updates[key];
  }

  // Handle coordinates as a pair
  if (updates.lat !== undefined && updates.lng !== undefined) {
    safeUpdates['serviceProvider.location.coordinates'] = [updates.lng, updates.lat];
    safeUpdates['serviceProvider.location.type'] = 'Point';
    delete safeUpdates['serviceProvider.location.coordinates.0'];
    delete safeUpdates['serviceProvider.location.coordinates.1'];
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: safeUpdates },
    { new: true, runValidators: true }
  ).select('-refreshTokens');

  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'NOT_FOUND' });
  return user;
};

// ── List Engineers (public directory) ─────────────────────────────────────
export const listEngineers = async (query: {
  specialization?: string;
  city?: string;
  verified?: boolean;
  lat?: string;
  lng?: string;
  radius?: string;
  page?: number;
  limit?: number;
}) => {
  const filter: any = { role: 'service_provider', isActive: true };
  if (query.verified !== false) filter['serviceProvider.isVerified'] = true;
  if (query.specialization) filter['serviceProvider.specializations'] = query.specialization;
  if (query.city) {
    filter.$or = getCityPatterns(query.city).flatMap((cityPattern) => [
      { 'serviceProvider.serviceArea.city': cityPattern },
      { 'serviceProvider.serviceArea.country': cityPattern },
    ]);
  }

  const page = query.page || 1;
  const limit = Math.min(query.limit || 20, 50);
  const skip = (page - 1) * limit;

  const lat = toFiniteNumber(query.lat);
  const lng = toFiniteNumber(query.lng);
  if (lat !== undefined && lng !== undefined) {
    const radiusKm = toFiniteNumber(query.radius) || 25;
    const data = await User.find({
      ...filter,
      'serviceProvider.location': {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      },
    }).select('profile businessDetails.licenseNumber serviceProvider').skip(skip).limit(limit);
    const total = data.length;
    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  const [data, total] = await Promise.all([
    User.find(filter)
      .select('profile businessDetails.licenseNumber serviceProvider')
      .sort({ 'serviceProvider.averageRating': -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

// ── Get Single Engineer Profile (public) ─────────────────────────────────
export const getEngineerById = async (engineerId: string) => {
  if (!Types.ObjectId.isValid(engineerId)) {
    throw Object.assign(new Error('Invalid engineer ID'), { statusCode: 400, code: 'INVALID_ID' });
  }
  const engineer = await User.findOne({ _id: engineerId, role: 'service_provider', isActive: true })
    .select('profile businessDetails.licenseNumber serviceProvider');
  if (!engineer) {
    throw Object.assign(new Error('Engineer not found'), { statusCode: 404, code: 'NOT_FOUND' });
  }
  return engineer;
};

// ── Delete Account (soft) ─────────────────────────────────────────────────
export const deleteAccount = async (userId: string, confirmText: string) => {
  if (confirmText !== 'DELETE MY ACCOUNT') {
    throw Object.assign(new Error('Confirmation text mismatch'), { statusCode: 400, code: 'CONFIRM_TEXT_MISMATCH' });
  }
  await User.findByIdAndUpdate(userId, { isDeleted: true, deletedAt: new Date(), isActive: false, refreshTokens: [] });
  return { message: 'Account deleted' };
};
