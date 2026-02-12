-- =============================================
-- AllCert Supabase 테이블 생성 (DDL)
-- =============================================

-- 1. 자격증 테이블
CREATE TABLE IF NOT EXISTS certifications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  organization TEXT NOT NULL,
  website TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 시험일정 테이블
CREATE TABLE IF NOT EXISTS exam_schedules (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL,
  certification_id TEXT NOT NULL,
  certification_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  round TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_exam_schedules_date ON exam_schedules (date);
CREATE INDEX IF NOT EXISTS idx_exam_schedules_cert_id ON exam_schedules (certification_id);

-- RLS 설정
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read certifications" ON certifications FOR SELECT USING (true);
CREATE POLICY "Allow public read exam_schedules" ON exam_schedules FOR SELECT USING (true);
