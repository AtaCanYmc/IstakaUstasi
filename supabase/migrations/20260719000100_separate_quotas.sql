-- Migration: separate quota counts into a dedicated user_quotas table

create table if not exists public.user_quotas (
    user_id uuid references public.users on delete cascade not null,
    quota_type text not null,
    quota_count integer not null,
    last_reset_date timestamp with time zone not null default now(),
    primary key (user_id, quota_type)
);

-- Copy existing user quotas if any
insert into public.user_quotas (user_id, quota_type, quota_count, last_reset_date)
select id, 'image', image_quota_count, last_reset_date from public.users
on conflict (user_id, quota_type) do nothing;

insert into public.user_quotas (user_id, quota_type, quota_count, last_reset_date)
select id, 'solver', solver_quota_count, last_reset_date from public.users
on conflict (user_id, quota_type) do nothing;

-- Drop old columns from users table
alter table public.users drop column if exists image_quota_count;
alter table public.users drop column if exists solver_quota_count;
alter table public.users drop column if exists last_reset_date;
