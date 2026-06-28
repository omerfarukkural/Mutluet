-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enums
create type user_role as enum ('user', 'volunteer', 'member', 'admin', 'super_admin');
create type event_status as enum ('taslak', 'onay_bekliyor', 'yayinda', 'doldu', 'suresi_doldu', 'tamamlandi', 'iptal');
create type event_category as enum ('doga', 'kamp', 'hasta_ziyareti', 'tanisma', 'oyun', 'sanat', 'cevre', 'egitim', 'yemek', 'spor', 'kultur', 'hackathon');
create type season as enum ('ilkbahar', 'yaz', 'sonbahar', 'kis');
create type membership_status as enum ('bekliyor', 'aktif', 'askida', 'iptal');
create type registration_status as enum ('kayitli', 'bekleme_listesi', 'iptal', 'tamamlandi');

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role user_role not null default 'user',
  xp integer not null default 0,
  level integer not null default 1,
  streak_days integer not null default 0,
  last_login_at timestamptz,
  bio text,
  city text,
  phone text,
  is_leader_willing boolean not null default false,
  profile_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User interests (for matching engine)
create table public.user_interests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  category event_category not null,
  skill_level integer not null default 1 check (skill_level between 1 and 5),
  created_at timestamptz not null default now(),
  unique(user_id, category)
);

-- Events
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  category event_category not null,
  status event_status not null default 'taslak',
  leader_id uuid references public.users(id) not null,
  season season not null default 'ilkbahar',
  location_name text,
  location_lat double precision,
  location_lng double precision,
  city text,
  max_capacity integer not null default 20,
  current_participants integer not null default 0,
  event_date timestamptz not null,
  event_end_date timestamptz,
  xp_reward integer not null default 50,
  image_url text,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Event registrations
create table public.event_registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  status registration_status not null default 'kayitli',
  registered_at timestamptz not null default now(),
  unique(event_id, user_id)
);

-- XP transactions (immutable log)
create table public.xp_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  amount integer not null,
  reason text not null,
  reference_id uuid,
  reference_type text,
  created_at timestamptz not null default now()
);

-- Badges
create table public.badges (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  icon text not null,
  criteria jsonb not null default '{}',
  xp_bonus integer not null default 0
);

create table public.user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  badge_id uuid references public.badges(id) not null,
  earned_at timestamptz not null default now(),
  unique(user_id, badge_id)
);

-- Competitions
create table public.competitions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  type text not null default 'bireysel',
  start_at timestamptz not null,
  end_at timestamptz not null,
  scoring_rule jsonb not null default '{}',
  reward_xp integer not null default 500,
  reward_description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.competition_entries (
  id uuid primary key default uuid_generate_v4(),
  competition_id uuid references public.competitions(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  score integer not null default 0,
  rank integer,
  joined_at timestamptz not null default now(),
  unique(competition_id, user_id)
);

-- Season config
create table public.season_config (
  id uuid primary key default uuid_generate_v4(),
  season_key season not null unique,
  start_month integer not null,
  start_day integer not null,
  end_month integer not null,
  end_day integer not null,
  is_active boolean not null default false,
  admin_override season,
  updated_at timestamptz not null default now()
);

insert into public.season_config (season_key, start_month, start_day, end_month, end_day) values
  ('ilkbahar', 3, 1, 5, 31),
  ('yaz', 6, 1, 8, 31),
  ('sonbahar', 9, 1, 11, 30),
  ('kis', 12, 1, 2, 28);

-- Memberships
create table public.memberships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null unique,
  status membership_status not null default 'bekliyor',
  member_number text unique,
  notes text,
  applied_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references public.users(id)
);

-- Notifications
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  body text not null,
  type text not null,
  reference_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Match scores (for matching engine, prevents duplicate notifications)
create table public.match_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  event_id uuid references public.events(id) on delete cascade not null,
  score float not null,
  notification_sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, event_id)
);

-- Job listings
create table public.job_listings (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  type text not null default 'gonullu',
  compensation text,
  xp_reward integer not null default 0,
  location text,
  deadline timestamptz,
  is_active boolean not null default true,
  posted_by uuid references public.users(id) not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index on public.events(status, event_date);
create index on public.events(category);
create index on public.events(city);
create index on public.event_registrations(user_id);
create index on public.event_registrations(event_id);
create index on public.xp_transactions(user_id);
create index on public.notifications(user_id, is_read);
create index on public.user_interests(user_id);

-- RLS
alter table public.users enable row level security;
alter table public.user_interests enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.xp_transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.memberships enable row level security;
alter table public.match_scores enable row level security;

-- RLS Policies: users
create policy "Public profiles readable" on public.users for select using (true);
create policy "Users update own" on public.users for update using (auth.uid() = id);

-- RLS Policies: events
create policy "Published events readable by all" on public.events for select using (status = 'yayinda' or auth.uid() = leader_id);
create policy "Leaders create events" on public.events for insert with check (auth.uid() = leader_id);
create policy "Leaders update own events" on public.events for update using (auth.uid() = leader_id);

-- RLS Policies: event_registrations
create policy "Users see own registrations" on public.event_registrations for select using (auth.uid() = user_id);
create policy "Users register" on public.event_registrations for insert with check (auth.uid() = user_id);

-- RLS Policies: notifications
create policy "Users see own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- RLS Policies: xp_transactions
create policy "Users see own xp" on public.xp_transactions for select using (auth.uid() = user_id);

-- RLS Policies: memberships
create policy "Users see own membership" on public.memberships for select using (auth.uid() = user_id);
create policy "Users apply for membership" on public.memberships for insert with check (auth.uid() = user_id);

-- Function: auto-update user level based on XP
create or replace function update_user_level()
returns trigger language plpgsql as $$
begin
  update public.users set
    level = case
      when xp >= 20000 then 6
      when xp >= 10000 then 5
      when xp >= 5000  then 4
      when xp >= 2000  then 3
      when xp >= 500   then 2
      else 1
    end,
    updated_at = now()
  where id = new.user_id;
  return new;
end;
$$;

create trigger on_xp_added
  after insert on public.xp_transactions
  for each row execute function update_user_level();

-- Function: handle new auth user
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
