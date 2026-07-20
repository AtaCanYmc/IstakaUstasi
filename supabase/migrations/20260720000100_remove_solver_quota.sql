-- Migration: Delete all existing 'solver' quota rows from public.user_quotas
delete from public.user_quotas where quota_type = 'solver';
