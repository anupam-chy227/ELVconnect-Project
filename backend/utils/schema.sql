CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS vendor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(180) NOT NULL,
  category VARCHAR(60) NOT NULL CHECK (
    category IN (
      'CCTV',
      'Fire',
      'Networking',
      'Access Control',
      'BMS',
      'PA System',
      'Intercom',
      'Gate Automation',
      'Other'
    )
  ),
  location_lat NUMERIC(10, 7) CHECK (location_lat >= -90 AND location_lat <= 90),
  location_lng NUMERIC(10, 7) CHECK (location_lng >= -180 AND location_lng <= 180),
  service_radius INTEGER NOT NULL CHECK (service_radius > 0),
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  performance_score NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 5),
  certifications TEXT[] NOT NULL DEFAULT '{}',
  documents TEXT[] NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected')
  ),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_profiles_owner_id
  ON vendor_profiles(owner_id);

CREATE INDEX IF NOT EXISTS idx_vendor_profiles_status
  ON vendor_profiles(status);

CREATE INDEX IF NOT EXISTS idx_vendor_profiles_category
  ON vendor_profiles(category);

CREATE INDEX IF NOT EXISTS idx_vendor_profiles_location
  ON vendor_profiles(location_lat, location_lng);

CREATE TABLE IF NOT EXISTS vendor_score_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL UNIQUE REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  completion_rate NUMERIC(3, 2) NOT NULL CHECK (completion_rate >= 0 AND completion_rate <= 5),
  quality NUMERIC(3, 2) NOT NULL CHECK (quality >= 0 AND quality <= 5),
  rating NUMERIC(3, 2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  response_time NUMERIC(3, 2) NOT NULL CHECK (response_time >= 0 AND response_time <= 5),
  compliance NUMERIC(3, 2) NOT NULL CHECK (compliance >= 0 AND compliance <= 5),
  score NUMERIC(3, 2) NOT NULL CHECK (score >= 0 AND score <= 5),
  scored_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_score_metrics_vendor_id
  ON vendor_score_metrics(vendor_id);

CREATE INDEX IF NOT EXISTS idx_vendor_score_metrics_score
  ON vendor_score_metrics(score);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(60) NOT NULL CHECK (
    category IN (
      'CCTV',
      'Fire',
      'Networking',
      'Access Control',
      'BMS',
      'PA System',
      'Intercom',
      'Gate Automation',
      'Other'
    )
  ),
  location_lat NUMERIC(10, 7) NOT NULL CHECK (location_lat >= -90 AND location_lat <= 90),
  location_lng NUMERIC(10, 7) NOT NULL CHECK (location_lng >= -180 AND location_lng <= 180),
  budget NUMERIC(12, 2) NOT NULL CHECK (budget >= 0),
  description TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (
    status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_customer_id
  ON projects(customer_id);

CREATE INDEX IF NOT EXISTS idx_projects_status
  ON projects(status);

CREATE INDEX IF NOT EXISTS idx_projects_category
  ON projects(category);

CREATE TABLE IF NOT EXISTS site_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'completed')
  ),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_visits_customer_id
  ON site_visits(customer_id);

CREATE INDEX IF NOT EXISTS idx_site_visits_vendor_id
  ON site_visits(vendor_id);

CREATE INDEX IF NOT EXISTS idx_site_visits_status
  ON site_visits(status);

CREATE INDEX IF NOT EXISTS idx_site_visits_scheduled_at
  ON site_visits(scheduled_at);

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  boq_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (
    status IN ('submitted', 'accepted', 'rejected')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, vendor_id)
);

CREATE INDEX IF NOT EXISTS idx_quotes_project_id
  ON quotes(project_id);

CREATE INDEX IF NOT EXISTS idx_quotes_vendor_id
  ON quotes(vendor_id);

CREATE INDEX IF NOT EXISTS idx_quotes_amount
  ON quotes(amount);

CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage VARCHAR(30) NOT NULL CHECK (
    stage IN ('survey', 'quote', 'installation', 'testing', 'handover')
  ),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_progress', 'completed')
  ),
  proof_images TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, stage)
);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id
  ON project_milestones(project_id);

CREATE INDEX IF NOT EXISTS idx_project_milestones_stage
  ON project_milestones(stage);

CREATE INDEX IF NOT EXISTS idx_project_milestones_status
  ON project_milestones(status);

CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(30) NOT NULL CHECK (
    document_type IN ('warranty', 'fire_noc', 'report', 'drawing')
  ),
  title VARCHAR(180) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  mime_type VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_documents_project_id
  ON project_documents(project_id);

CREATE INDEX IF NOT EXISTS idx_project_documents_document_type
  ON project_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_project_documents_uploaded_by
  ON project_documents(uploaded_by);

CREATE TABLE IF NOT EXISTS milestone_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES project_milestones(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(30) NOT NULL DEFAULT 'pending_admin_approval' CHECK (
    status IN ('pending_admin_approval', 'approved', 'rejected', 'paid')
  ),
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (milestone_id, vendor_id)
);

CREATE INDEX IF NOT EXISTS idx_milestone_payments_project_id
  ON milestone_payments(project_id);

CREATE INDEX IF NOT EXISTS idx_milestone_payments_milestone_id
  ON milestone_payments(milestone_id);

CREATE INDEX IF NOT EXISTS idx_milestone_payments_vendor_id
  ON milestone_payments(vendor_id);

CREATE INDEX IF NOT EXISTS idx_milestone_payments_status
  ON milestone_payments(status);

CREATE TABLE IF NOT EXISTS project_vendor_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  unassigned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_vendor_assignments_active_project
  ON project_vendor_assignments(project_id)
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_project_vendor_assignments_project_id
  ON project_vendor_assignments(project_id);

CREATE INDEX IF NOT EXISTS idx_project_vendor_assignments_vendor_id
  ON project_vendor_assignments(vendor_id);
