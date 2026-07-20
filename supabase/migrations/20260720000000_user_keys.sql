-- Migration: Create public.user_roboflow_keys table to store user-defined Roboflow API keys
create table if not exists public.user_roboflow_keys (
    user_id uuid references public.users on delete cascade primary key,
    api_key text not null,
    workspace text,
    workflow_id text,
    api_url text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

-- Enable RLS and add basic security policies if needed
alter table public.user_roboflow_keys enable row level security;

create policy "Users can manage their own Roboflow keys"
    on public.user_roboflow_keys
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
