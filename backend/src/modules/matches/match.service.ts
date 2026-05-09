import { Types } from 'mongoose';
import { Job } from '../jobs/job.model';
import { User } from '../users/user.model';

type LocationMode = 'all' | 'city' | 'geo';

type LocationMatchQuery = {
  city?: string;
  lat?: string;
  lng?: string;
  radius?: string;
  category?: string;
  limit?: number;
};

const DEFAULT_RADIUS_KM = 100;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 30;

const LOCATION_ALIASES: Record<string, string[]> = {
  'Delhi NCR': ['Delhi NCR', 'Delhi', 'New Delhi', 'Gurugram', 'Gurgaon', 'Noida', 'Faridabad', 'Ghaziabad', 'Manesar'],
  Maharashtra: ['Maharashtra', 'Mumbai', 'Pune', 'Navi Mumbai', 'Thane', 'Nagpur', 'Chakan'],
  Karnataka: ['Karnataka', 'Bengaluru', 'Bangalore', 'Mysuru'],
  Telangana: ['Telangana', 'Hyderabad', 'Secunderabad'],
  Gujarat: ['Gujarat', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Tamil Nadu': ['Tamil Nadu', 'Chennai', 'Coimbatore', 'Madurai'],
  'West Bengal': ['West Bengal', 'Kolkata', 'Howrah'],
};

const CATEGORY_ALIASES: Record<string, string> = {
  cctv: 'cctv',
  CCTV: 'cctv',
  Fire: 'fire_alarm',
  'Fire Safety': 'fire_alarm',
  fire_alarm: 'fire_alarm',
  Access: 'access_control',
  'Access Control': 'access_control',
  access_control: 'access_control',
  Networking: 'structured_cabling',
  Network: 'structured_cabling',
  'Data Networking': 'structured_cabling',
  structured_cabling: 'structured_cabling',
  BMS: 'bms',
  bms: 'bms',
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toFiniteNumber(value: string | undefined) {
  if (value === undefined || value.trim() === '') {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function normalizeLimit(value: number | undefined) {
  if (!value || !Number.isFinite(value)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.max(Math.floor(value), 1), MAX_LIMIT);
}

function normalizeCity(value: string | undefined) {
  const city = value?.trim();
  if (!city || city === 'All India') {
    return undefined;
  }

  return city;
}

function getCityPatterns(city: string) {
  return (LOCATION_ALIASES[city] || [city]).map((alias) => new RegExp(escapeRegExp(alias), 'i'));
}

function cityFieldConditions(fields: string[], city: string) {
  const patterns = getCityPatterns(city);
  return fields.flatMap((field) => patterns.map((pattern) => ({ [field]: pattern })));
}

function normalizeCategory(category: string | undefined) {
  if (!category || category === 'All') {
    return undefined;
  }

  return CATEGORY_ALIASES[category] || CATEGORY_ALIASES[category.replace(/\s+/g, '_')] || category;
}

function objectIdFromPopulate(value: unknown) {
  if (value instanceof Types.ObjectId) {
    return value.toString();
  }

  if (value && typeof value === 'object' && '_id' in value) {
    const maybeId = (value as { _id?: unknown })._id;
    return maybeId instanceof Types.ObjectId || typeof maybeId === 'string' ? String(maybeId) : undefined;
  }

  return typeof value === 'string' ? value : undefined;
}

function createGeoFilter(field: string, lat: number, lng: number, radiusKm: number) {
  return {
    [field]: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radiusKm * 1000,
      },
    },
  };
}

export async function getLocationMatches(query: LocationMatchQuery) {
  const city = normalizeCity(query.city);
  const lat = toFiniteNumber(query.lat);
  const lng = toFiniteNumber(query.lng);
  const radiusKm = Math.min(Math.max(toFiniteNumber(query.radius) ?? DEFAULT_RADIUS_KM, 1), 250);
  const limit = normalizeLimit(query.limit);
  const category = normalizeCategory(query.category);
  const mode: LocationMode = lat !== undefined && lng !== undefined ? 'geo' : city ? 'city' : 'all';

  const jobFilter: any = {
    visibility: 'public',
    status: { $in: ['open', 'applications_received'] },
  };
  const providerFilter: any = {
    role: 'service_provider',
    isActive: true,
    'serviceProvider.isVerified': true,
  };

  if (category) {
    jobFilter.category = category;
    providerFilter['serviceProvider.specializations'] = category;
  }

  if (mode === 'city' && city) {
    jobFilter.$or = cityFieldConditions(['location.city', 'location.address', 'location.country'], city);
    providerFilter.$or = cityFieldConditions(['serviceProvider.serviceArea.city', 'serviceProvider.serviceArea.country'], city);
  }

  const jobQuery =
    mode === 'geo' && lat !== undefined && lng !== undefined
      ? Job.find({ ...jobFilter, ...createGeoFilter('location', lat, lng, radiusKm) })
      : Job.find(jobFilter).sort({ createdAt: -1 });

  const providerQuery =
    mode === 'geo' && lat !== undefined && lng !== undefined
      ? User.find({ ...providerFilter, ...createGeoFilter('serviceProvider.location', lat, lng, radiusKm) })
      : User.find(providerFilter).sort({
          'serviceProvider.averageRating': -1,
          'serviceProvider.totalJobsCompleted': -1,
          createdAt: -1,
        });

  const [jobs, serviceProviders] = await Promise.all([
    jobQuery.limit(limit).populate('customerId', 'profile customer subscription createdAt').lean(),
    providerQuery
      .select('profile businessDetails.licenseNumber serviceProvider subscription createdAt')
      .limit(limit)
      .lean(),
  ]);

  const customerIds = Array.from(
    new Set(
      jobs
        .map((job) => objectIdFromPopulate(job.customerId))
        .filter((id): id is string => typeof id === 'string' && Types.ObjectId.isValid(id)),
    ),
  );

  const customers = customerIds.length
    ? await User.find({
        _id: { $in: customerIds.map((id) => new Types.ObjectId(id)) },
        role: 'customer',
        isActive: true,
      })
        .select('profile customer subscription createdAt')
        .limit(limit)
        .lean()
    : [];

  const vendorsWithBusinessIdentity = serviceProviders.filter(
    (provider) => provider.profile?.companyName || provider.businessDetails?.licenseNumber,
  );
  const vendors = vendorsWithBusinessIdentity.length ? vendorsWithBusinessIdentity : serviceProviders;

  const [jobTotal, providerTotal] =
    mode === 'geo'
      ? [jobs.length, serviceProviders.length]
      : await Promise.all([Job.countDocuments(jobFilter), User.countDocuments(providerFilter)]);

  return {
    location: {
      name: city || (mode === 'geo' ? 'Current Location' : 'All India'),
      city,
      lat,
      lng,
      radiusKm,
      mode,
    },
    engineers: serviceProviders,
    vendors,
    jobs,
    clients: customers,
    customers,
    counts: {
      engineers: providerTotal,
      vendors: mode === 'geo' ? vendors.length : providerTotal,
      jobs: jobTotal,
      clients: customers.length,
      customers: customers.length,
    },
    signals: {
      locationMode: mode,
      sameCityOnly: mode === 'city',
      sameRadiusOnly: mode === 'geo',
      category: category || null,
    },
  };
}
