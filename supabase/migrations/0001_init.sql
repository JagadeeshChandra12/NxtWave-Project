-- BuildLab 60 schema (demo reference)
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  college text not null,
  branch text not null,
  graduation_year int not null,
  phone text,
  project_idea text,
  referral_code text,
  referred_by text,
  consent boolean not null default false,
  source text,
  medium text,
  campaign text,
  referring_page text,
  attendance_verified boolean not null default false,
  certificate_id text,
  created_at timestamptz not null default now()
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  idea text not null,
  title text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists passports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  display_name text,
  project_title text,
  problem text,
  description text,
  technologies text[],
  ai_capability text,
  learned text,
  github_url text,
  demo_url text,
  status text,
  public boolean not null default false,
  share_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists competition_registrations (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references registrations(id),
  name text not null,
  email text not null,
  project_title text,
  description text,
  participation text,
  team_members text[],
  rules_agreed boolean not null default false,
  status text not null default 'registered',
  created_at timestamptz not null default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  competition_reg_id uuid references competition_registrations(id),
  title text not null,
  problem text,
  description text,
  features text[],
  technologies text[],
  ai_component text,
  github_url text,
  demo_url text,
  video_url text,
  declaration boolean not null default false,
  submitted_at timestamptz not null default now(),
  locked boolean not null default false
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions(id),
  judge_id uuid,
  functionality int,
  usefulness int,
  originality int,
  presentation int,
  total int,
  comments text,
  state text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid references registrations(id),
  participant_name text,
  workshop_title text,
  date text,
  certificate_id text unique,
  issued_at timestamptz not null default now(),
  issued_by text
);

-- RLS: enable and add policies in production. Admin operations must be server-side.

-- Row Level Security
alter table registrations enable row level security;
alter table passports enable row level security;
alter table competition_registrations enable row level security;
alter table submissions enable row level security;
alter table scores enable row level security;
alter table certificates enable row level security;
alter table plans enable row level security;

create policy "passports_public_read" on passports for select using (public = true);
create policy "passports_owner_all" on passports for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "registrations_owner_read" on registrations for select using (email = auth.jwt() ->> 'email');
create policy "registrations_insert" on registrations for insert with check (true);
create policy "submissions_insert" on submissions for insert with check (auth.role() = 'authenticated');
create policy "submissions_read" on submissions for select using (true);

create or replace function verify_attendance(reg_id uuid, verified boolean)
returns void language plpgsql security definer as $$
begin
  update registrations set attendance_verified = verified where id = reg_id;
end; $$;

create or replace function issue_certificate(reg_id uuid, participant_name text, wdate text, issued_by text)
returns text language plpgsql security definer as $$
declare cid text;
begin
  if not exists (select 1 from registrations where id = reg_id and attendance_verified = true) then
    raise exception 'Attendance not verified';
  end if;
  cid := 'BL60-' || extract(year from now())::text || '-' || upper(substr(md5(random()::text),1,6));
  insert into certificates (registration_id, participant_name, workshop_title, date, certificate_id, issued_by)
  values (reg_id, participant_name, 'Build Your First AI Project in 60 Minutes', wdate, cid, issued_by)
  on conflict (certificate_id) do nothing;
  return cid;
end; $$;
