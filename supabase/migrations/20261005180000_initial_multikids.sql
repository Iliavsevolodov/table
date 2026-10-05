-- MULTIKIDS initial schema.
-- auth.users is the canonical parent account table; children never require email accounts.

create type public.fact_operation as enum ('multiplication', 'division');
create type public.session_kind as enum ('diagnostic', 'adventure', 'practice', 'boss', 'tournament');
create type public.subscription_plan as enum ('free', 'premium');
create type public.subscription_status as enum ('inactive', 'trialing', 'active', 'past_due', 'cancelled');

create table public.parent_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  parent_pin_hash text,
  locale text not null default 'ru',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parent_profiles(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 24),
  birth_year smallint,
  hero_emoji text not null default '🧙',
  active_avatar_id uuid,
  active_pet_id uuid,
  diagnostic_completed_at timestamptz,
  diagnostic_score numeric(5,4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index child_profiles_parent_id_idx on public.child_profiles(parent_id);

create table public.avatars (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  base_asset_path text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.avatar_items (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  slot text not null check (slot in ('hair','hat','glasses','outfit','backpack','shoes','weapon','shield','wings','special')),
  rarity text not null default 'common',
  price_coins int not null default 0 check (price_coins >= 0),
  price_gems int not null default 0 check (price_gems >= 0),
  asset_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  emoji text not null,
  rarity text not null default 'common',
  unlock_rule jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.child_profiles
  add constraint child_profiles_active_avatar_fk foreign key (active_avatar_id) references public.avatars(id) on delete set null,
  add constraint child_profiles_active_pet_fk foreign key (active_pet_id) references public.pets(id) on delete set null;

create table public.worlds (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.regions (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds(id) on delete cascade,
  code text not null unique,
  name text not null,
  table_number smallint check (table_number between 1 and 10),
  theme jsonb not null default '{}'::jsonb,
  unlock_requirement jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index regions_world_id_idx on public.regions(world_id);

create table public.levels (
  id uuid primary key default gen_random_uuid(),
  region_id uuid not null references public.regions(id) on delete cascade,
  code text not null unique,
  name text not null,
  level_type text not null check (level_type in ('lesson','game','battle','puzzle','chest','boss','challenge')),
  config jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index levels_region_id_idx on public.levels(region_id);

create table public.fact_families (
  id uuid primary key default gen_random_uuid(),
  operand_low smallint not null check (operand_low between 1 and 10),
  operand_high smallint not null check (operand_high between 1 and 10),
  product smallint not null,
  created_at timestamptz not null default now(),
  unique (operand_low, operand_high, product)
);

create table public.learning_facts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.fact_families(id) on delete cascade,
  operation public.fact_operation not null,
  operand_a smallint not null,
  operand_b smallint not null check (operand_b > 0),
  result smallint not null,
  table_number smallint not null check (table_number between 1 and 10),
  created_at timestamptz not null default now(),
  unique(operation, operand_a, operand_b)
);
create index learning_facts_family_id_idx on public.learning_facts(family_id);
create index learning_facts_table_operation_idx on public.learning_facts(table_number, operation);

create table public.child_fact_mastery (
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  fact_id uuid not null references public.learning_facts(id) on delete cascade,
  mastery_score numeric(5,4) not null default 0 check (mastery_score between 0 and 1),
  mastery_level smallint not null default 0 check (mastery_level between 0 and 6),
  attempts_count int not null default 0 check (attempts_count >= 0),
  correct_count int not null default 0 check (correct_count >= 0),
  wrong_count int not null default 0 check (wrong_count >= 0),
  average_response_time_ms int,
  last_response_time_ms int,
  current_streak int not null default 0,
  last_seen_at timestamptz,
  next_review_at timestamptz,
  interval_days numeric(8,2) not null default 0,
  ease_factor numeric(5,2) not null default 2.30,
  hints_used int not null default 0,
  successful_reviews int not null default 0,
  updated_at timestamptz not null default now(),
  primary key(child_id, fact_id)
);
create index child_fact_mastery_review_idx on public.child_fact_mastery(child_id, next_review_at);
create index child_fact_mastery_weak_idx on public.child_fact_mastery(child_id, mastery_score);

create table public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  kind public.session_kind not null,
  region_id uuid references public.regions(id) on delete set null,
  level_id uuid references public.levels(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  questions_count int not null default 0,
  correct_count int not null default 0,
  duration_seconds int,
  metadata jsonb not null default '{}'::jsonb
);
create index learning_sessions_child_started_idx on public.learning_sessions(child_id, started_at desc);

create table public.question_attempts (
  id bigint generated by default as identity primary key,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  fact_id uuid not null references public.learning_facts(id) on delete restrict,
  session_id uuid references public.learning_sessions(id) on delete set null,
  answer_value int,
  correct_answer int not null,
  is_correct boolean not null,
  response_time_ms int not null check (response_time_ms >= 0),
  question_type text not null,
  hints_used smallint not null default 0,
  game_mode text not null,
  created_at timestamptz not null default now()
);
create index question_attempts_child_created_idx on public.question_attempts(child_id, created_at desc);
create index question_attempts_fact_child_idx on public.question_attempts(fact_id, child_id);

create table public.currencies (
  code text primary key,
  name text not null,
  icon text not null
);

create table public.child_currencies (
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  currency_code text not null references public.currencies(code) on delete restrict,
  balance int not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now(),
  primary key(child_id, currency_code)
);

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  reward_type text not null,
  payload jsonb not null default '{}'::jsonb,
  rarity text not null default 'common',
  is_active boolean not null default true
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  item_type text not null,
  item_id uuid,
  item_code text,
  quantity int not null default 1 check (quantity > 0),
  acquired_at timestamptz not null default now()
);
create index inventory_child_idx on public.inventory(child_id, acquired_at desc);

create table public.child_pets (
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  pet_level int not null default 1 check (pet_level > 0),
  pet_xp int not null default 0 check (pet_xp >= 0),
  nickname text,
  unlocked_at timestamptz not null default now(),
  primary key(child_id, pet_id)
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  icon text,
  criteria jsonb not null default '{}'::jsonb,
  reward_id uuid references public.rewards(id) on delete set null,
  is_active boolean not null default true
);

create table public.child_achievements (
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key(child_id, achievement_id)
);

create table public.daily_missions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  criteria jsonb not null,
  reward_id uuid references public.rewards(id) on delete set null,
  is_active boolean not null default true
);

create table public.mission_progress (
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  mission_id uuid not null references public.daily_missions(id) on delete cascade,
  mission_date date not null default current_date,
  progress int not null default 0,
  target int not null,
  completed_at timestamptz,
  primary key(child_id, mission_id, mission_date)
);

create table public.streaks (
  child_id uuid primary key references public.child_profiles(id) on delete cascade,
  current_days int not null default 0,
  best_days int not null default 0,
  shields int not null default 0,
  last_activity_date date,
  updated_at timestamptz not null default now()
);

create table public.game_progress (
  child_id uuid primary key references public.child_profiles(id) on delete cascade,
  player_level int not null default 1,
  xp int not null default 0,
  current_region_id uuid references public.regions(id) on delete set null,
  completed_levels jsonb not null default '[]'::jsonb,
  unlocked_regions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  cost_coins int not null default 0 check (cost_coins >= 0),
  unlock_rule jsonb not null default '{}'::jsonb,
  is_active boolean not null default true
);

create table public.child_world_buildings (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  building_id uuid not null references public.buildings(id) on delete cascade,
  position_x smallint,
  position_y smallint,
  level int not null default 1,
  built_at timestamptz not null default now(),
  unique(child_id, building_id)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parent_profiles(id) on delete cascade,
  plan public.subscription_plan not null default 'free',
  status public.subscription_status not null default 'inactive',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index subscriptions_provider_id_uidx on public.subscriptions(provider, provider_subscription_id) where provider_subscription_id is not null;

create table public.parent_reports (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parent_profiles(id) on delete cascade,
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  report jsonb not null,
  generated_at timestamptz not null default now()
);
create index parent_reports_parent_child_idx on public.parent_reports(parent_id, child_id, generated_at desc);

create table public.settings (
  parent_id uuid primary key references public.parent_profiles(id) on delete cascade,
  sound_enabled boolean not null default true,
  music_enabled boolean not null default true,
  reduced_motion_override boolean,
  notification_preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.analytics_events (
  id bigint generated by default as identity primary key,
  parent_id uuid references public.parent_profiles(id) on delete cascade,
  child_id uuid references public.child_profiles(id) on delete cascade,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
create index analytics_events_name_time_idx on public.analytics_events(event_name, occurred_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger parent_profiles_updated_at before update on public.parent_profiles for each row execute function public.set_updated_at();
create trigger child_profiles_updated_at before update on public.child_profiles for each row execute function public.set_updated_at();
create trigger child_fact_mastery_updated_at before update on public.child_fact_mastery for each row execute function public.set_updated_at();
create trigger child_currencies_updated_at before update on public.child_currencies for each row execute function public.set_updated_at();
create trigger streaks_updated_at before update on public.streaks for each row execute function public.set_updated_at();
create trigger game_progress_updated_at before update on public.game_progress for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger settings_updated_at before update on public.settings for each row execute function public.set_updated_at();

-- Seed mathematical families ×1..×10. Each ordered fact remains an independent skill.
insert into public.fact_families(operand_low, operand_high, product)
select least(a,b), greatest(a,b), a*b
from generate_series(1,10) a cross join generate_series(1,10) b
on conflict do nothing;

insert into public.learning_facts(family_id, operation, operand_a, operand_b, result, table_number)
select ff.id, 'multiplication'::public.fact_operation, a, b, a*b, a
from generate_series(1,10) a
cross join generate_series(1,10) b
join public.fact_families ff on ff.operand_low=least(a,b) and ff.operand_high=greatest(a,b) and ff.product=a*b
on conflict do nothing;

insert into public.learning_facts(family_id, operation, operand_a, operand_b, result, table_number)
select ff.id, 'division'::public.fact_operation, a*b, a, b, a
from generate_series(1,10) a
cross join generate_series(1,10) b
join public.fact_families ff on ff.operand_low=least(a,b) and ff.operand_high=greatest(a,b) and ff.product=a*b
on conflict do nothing;

insert into public.currencies(code,name,icon) values ('coins','Монеты','🪙'),('gems','Кристаллы','💎') on conflict do nothing;
insert into public.worlds(code,name,description,sort_order) values ('main','Мир приключений','Основная карта MULTIKIDS',1) on conflict do nothing;

insert into public.regions(world_id, code, name, table_number, theme, sort_order)
select w.id, seed.code, seed.name, seed.table_number, seed.theme, seed.sort_order
from public.worlds w
cross join (values
 ('valley-2','Долина двойки',2,'{"emoji":"🌿","palette":"green"}'::jsonb,2),
 ('island-3','Остров тройки',3,'{"emoji":"🏝️","palette":"aqua"}'::jsonb,3),
 ('kingdom-4','Королевство четвёрки',4,'{"emoji":"🏰","palette":"amber"}'::jsonb,4),
 ('city-5','Город пятёрки',5,'{"emoji":"🎡","palette":"coral"}'::jsonb,5),
 ('ice-6','Ледяные земли шестёрки',6,'{"emoji":"❄️","palette":"ice"}'::jsonb,6),
 ('temple-7','Земли семёрки',7,'{"emoji":"🗿","palette":"jungle"}'::jsonb,7),
 ('robot-8','Мир восьмёрки',8,'{"emoji":"🤖","palette":"steel"}'::jsonb,8),
 ('space-9','Космос девятки',9,'{"emoji":"🚀","palette":"space"}'::jsonb,9)
) as seed(code,name,table_number,theme,sort_order)
where w.code='main'
on conflict(code) do nothing;

-- RLS is enabled on every exposed table. Content is read-only publicly; user data is owner-scoped.
alter table public.parent_profiles enable row level security;
alter table public.child_profiles enable row level security;
alter table public.avatars enable row level security;
alter table public.avatar_items enable row level security;
alter table public.pets enable row level security;
alter table public.worlds enable row level security;
alter table public.regions enable row level security;
alter table public.levels enable row level security;
alter table public.fact_families enable row level security;
alter table public.learning_facts enable row level security;
alter table public.child_fact_mastery enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.question_attempts enable row level security;
alter table public.currencies enable row level security;
alter table public.child_currencies enable row level security;
alter table public.rewards enable row level security;
alter table public.inventory enable row level security;
alter table public.child_pets enable row level security;
alter table public.achievements enable row level security;
alter table public.child_achievements enable row level security;
alter table public.daily_missions enable row level security;
alter table public.mission_progress enable row level security;
alter table public.streaks enable row level security;
alter table public.game_progress enable row level security;
alter table public.buildings enable row level security;
alter table public.child_world_buildings enable row level security;
alter table public.subscriptions enable row level security;
alter table public.parent_reports enable row level security;
alter table public.settings enable row level security;
alter table public.analytics_events enable row level security;

create policy "parents own profile" on public.parent_profiles for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "parents own children" on public.child_profiles for all to authenticated using (exists(select 1 from public.parent_profiles p where p.id=parent_id and p.user_id=(select auth.uid()))) with check (exists(select 1 from public.parent_profiles p where p.id=parent_id and p.user_id=(select auth.uid())));

-- Public curriculum/catalog tables contain no child data.
create policy "avatars readable" on public.avatars for select to anon, authenticated using (is_active);
create policy "avatar items readable" on public.avatar_items for select to anon, authenticated using (is_active);
create policy "pets readable" on public.pets for select to anon, authenticated using (is_active);
create policy "worlds readable" on public.worlds for select to anon, authenticated using (is_active);
create policy "regions readable" on public.regions for select to anon, authenticated using (is_active);
create policy "levels readable" on public.levels for select to anon, authenticated using (is_active);
create policy "families readable" on public.fact_families for select to anon, authenticated using (true);
create policy "facts readable" on public.learning_facts for select to anon, authenticated using (true);
create policy "currencies readable" on public.currencies for select to anon, authenticated using (true);
create policy "rewards readable" on public.rewards for select to anon, authenticated using (is_active);
create policy "achievements readable" on public.achievements for select to anon, authenticated using (is_active);
create policy "missions readable" on public.daily_missions for select to anon, authenticated using (is_active);
create policy "buildings readable" on public.buildings for select to anon, authenticated using (is_active);

-- Child-owned tables share the same ownership predicate through child_profiles -> parent_profiles.
do $$
declare t text;
begin
  foreach t in array array['child_fact_mastery','learning_sessions','question_attempts','child_currencies','inventory','child_pets','child_achievements','mission_progress','streaks','game_progress','child_world_buildings']
  loop
    execute format('create policy %I on public.%I for all to authenticated using (exists(select 1 from public.child_profiles c join public.parent_profiles p on p.id=c.parent_id where c.id=child_id and p.user_id=(select auth.uid()))) with check (exists(select 1 from public.child_profiles c join public.parent_profiles p on p.id=c.parent_id where c.id=child_id and p.user_id=(select auth.uid())))', 'owner access '||t, t);
  end loop;
end $$;

create policy "parents own subscriptions" on public.subscriptions for select to authenticated using (exists(select 1 from public.parent_profiles p where p.id=parent_id and p.user_id=(select auth.uid())));
create policy "parents own reports" on public.parent_reports for select to authenticated using (exists(select 1 from public.parent_profiles p where p.id=parent_id and p.user_id=(select auth.uid())));
create policy "parents own settings" on public.settings for all to authenticated using (exists(select 1 from public.parent_profiles p where p.id=parent_id and p.user_id=(select auth.uid()))) with check (exists(select 1 from public.parent_profiles p where p.id=parent_id and p.user_id=(select auth.uid())));
create policy "parents own analytics" on public.analytics_events for insert to authenticated with check (
  (parent_id is null or exists(select 1 from public.parent_profiles p where p.id=parent_id and p.user_id=(select auth.uid())))
  and
  (child_id is null or exists(select 1 from public.child_profiles c join public.parent_profiles p on p.id=c.parent_id where c.id=child_id and p.user_id=(select auth.uid())))
);

-- Explicit Data API grants for 2026 Supabase exposure defaults. RLS remains the authorization layer.
grant usage on schema public to anon, authenticated;
grant select on public.avatars, public.avatar_items, public.pets, public.worlds, public.regions, public.levels, public.fact_families, public.learning_facts, public.currencies, public.rewards, public.achievements, public.daily_missions, public.buildings to anon, authenticated;
grant select, insert, update, delete on public.parent_profiles, public.child_profiles, public.child_fact_mastery, public.learning_sessions, public.question_attempts, public.child_currencies, public.inventory, public.child_pets, public.child_achievements, public.mission_progress, public.streaks, public.game_progress, public.child_world_buildings, public.settings to authenticated;
grant select on public.subscriptions, public.parent_reports to authenticated;
grant insert on public.analytics_events to authenticated;
grant usage, select on all sequences in schema public to authenticated;
