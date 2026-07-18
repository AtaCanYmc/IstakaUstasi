-- Initial schema setup for IstakaUstasi users and quota logs
create table if not exists public.users (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    username text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create table if not exists public.user_quotas (
    user_id uuid references public.users on delete cascade not null,
    quota_type text not null, -- e.g. 'image', 'solver'
    quota_count integer not null,
    last_reset_date timestamp with time zone not null default now(),
    primary key (user_id, quota_type)
);

create table if not exists public.quota_logs (
    id bigserial primary key,
    user_id uuid references public.users on delete cascade not null,
    action text not null,
    timestamp timestamp with time zone not null default now()
);
