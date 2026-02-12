-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'waitlist');
CREATE TYPE visit_slot_status AS ENUM ('open', 'closed', 'cancelled');

-- =====================================================
-- COMPANIES TABLE
-- =====================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  address TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_website CHECK (website IS NULL OR website ~* '^https?://'),
  CONSTRAINT unique_user_company UNIQUE(user_id)
);

-- Index for faster lookups
CREATE INDEX idx_companies_user_id ON companies(user_id);

-- =====================================================
-- VISIT SLOTS TABLE
-- =====================================================
CREATE TABLE visit_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_participants INTEGER NOT NULL CHECK (max_participants > 0),
  current_participants INTEGER NOT NULL DEFAULT 0 CHECK (current_participants >= 0),
  location TEXT,
  status visit_slot_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_participants CHECK (current_participants <= max_participants),
  CONSTRAINT future_slot CHECK (start_time > created_at)
);

-- Indexes for calendar queries
CREATE INDEX idx_visit_slots_company_id ON visit_slots(company_id);
CREATE INDEX idx_visit_slots_start_time ON visit_slots(start_time);
CREATE INDEX idx_visit_slots_status ON visit_slots(status);
CREATE INDEX idx_visit_slots_date_range ON visit_slots(start_time, end_time);

-- =====================================================
-- APPLICATIONS TABLE
-- =====================================================
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_slot_id UUID NOT NULL REFERENCES visit_slots(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  school TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  motivation_message TEXT NOT NULL CHECK (LENGTH(motivation_message) >= 50),
  cv_url TEXT,
  status application_status NOT NULL DEFAULT 'pending',
  exported_to_airtable BOOLEAN NOT NULL DEFAULT FALSE,
  airtable_record_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_phone CHECK (phone ~* '^\+?[0-9\s\-\(\)]{10,}$'),
  CONSTRAINT unique_email_per_slot UNIQUE(visit_slot_id, email)
);

-- Indexes for faster queries
CREATE INDEX idx_applications_visit_slot_id ON applications(visit_slot_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_email ON applications(email);
CREATE INDEX idx_applications_created_at ON applications(created_at);
CREATE INDEX idx_applications_exported ON applications(exported_to_airtable) WHERE exported_to_airtable = FALSE;

-- =====================================================
-- STATUS CHANGE HISTORY TABLE
-- =====================================================
CREATE TABLE status_change_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  old_status application_status,
  new_status application_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for audit trail queries
CREATE INDEX idx_status_history_application_id ON status_change_history(application_id);
CREATE INDEX idx_status_history_changed_at ON status_change_history(changed_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visit_slots_updated_at BEFORE UPDATE ON visit_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Track status changes
CREATE OR REPLACE FUNCTION track_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO status_change_history (application_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_status_change AFTER UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION track_application_status_change();

-- Update participant counter when application status changes
CREATE OR REPLACE FUNCTION update_participant_counter()
RETURNS TRIGGER AS $$
BEGIN
  -- If new application is accepted, increment counter
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE visit_slots
    SET current_participants = current_participants + 1
    WHERE id = NEW.visit_slot_id;

  -- If status changes to accepted, increment
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    UPDATE visit_slots
    SET current_participants = current_participants + 1
    WHERE id = NEW.visit_slot_id;

  -- If status changes from accepted to something else, decrement
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
    UPDATE visit_slots
    SET current_participants = current_participants - 1
    WHERE id = OLD.visit_slot_id;

  -- If accepted application is deleted, decrement
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE visit_slots
    SET current_participants = current_participants - 1
    WHERE id = OLD.visit_slot_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_participant_count_on_insert AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION update_participant_counter();

CREATE TRIGGER update_participant_count_on_update AFTER UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_participant_counter();

CREATE TRIGGER update_participant_count_on_delete AFTER DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_participant_counter();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_change_history ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Companies can view their own profile"
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Companies can create their own profile"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Companies can update their own profile"
  ON companies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Companies can delete their own profile"
  ON companies FOR DELETE
  USING (auth.uid() = user_id);

-- Visit slots policies
CREATE POLICY "Anyone can view open visit slots"
  ON visit_slots FOR SELECT
  USING (status = 'open' OR company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));

CREATE POLICY "Companies can create their own visit slots"
  ON visit_slots FOR INSERT
  WITH CHECK (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));

CREATE POLICY "Companies can update their own visit slots"
  ON visit_slots FOR UPDATE
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));

CREATE POLICY "Companies can delete their own visit slots"
  ON visit_slots FOR DELETE
  USING (company_id IN (
    SELECT id FROM companies WHERE user_id = auth.uid()
  ));

-- Applications policies
CREATE POLICY "Anyone can create applications"
  ON applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Companies can view applications for their slots"
  ON applications FOR SELECT
  USING (visit_slot_id IN (
    SELECT vs.id FROM visit_slots vs
    JOIN companies c ON c.id = vs.company_id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "Companies can update applications for their slots"
  ON applications FOR UPDATE
  USING (visit_slot_id IN (
    SELECT vs.id FROM visit_slots vs
    JOIN companies c ON c.id = vs.company_id
    WHERE c.user_id = auth.uid()
  ));

-- Status change history policies
CREATE POLICY "Companies can view history for their applications"
  ON status_change_history FOR SELECT
  USING (application_id IN (
    SELECT a.id FROM applications a
    JOIN visit_slots vs ON vs.id = a.visit_slot_id
    JOIN companies c ON c.id = vs.company_id
    WHERE c.user_id = auth.uid()
  ));

-- =====================================================
-- STORAGE BUCKET FOR CVs
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs',
  'cvs',
  false,
  5242880, -- 5 MB
  ARRAY['application/pdf']
);

-- Storage policies
CREATE POLICY "Anyone can upload CVs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cvs');

CREATE POLICY "Companies can download CVs for their applications"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'cvs' AND
    (storage.foldername(name))[1] IN (
      SELECT a.id::text FROM applications a
      JOIN visit_slots vs ON vs.id = a.visit_slot_id
      JOIN companies c ON c.id = vs.company_id
      WHERE c.user_id = auth.uid()
    )
  );
