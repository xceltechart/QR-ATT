-- ============================================================================
-- Clean up pending (unconfirmed) sign-ups
-- ============================================================================
-- WHY: This project has "Confirm email" ENABLED (mailer_autoconfirm = false),
-- but no SMTP provider configured yet, so sign-up emails never arrive. Every
-- test sign-up therefore leaves a "pending" account in auth.users, which
-- permanently blocks that email from being registered again ("An account with
-- this email already exists").
--
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
--
-- AFTER deleting, the SAME problem will repeat unless you also do one of:
--   1) Supabase Dashboard -> Authentication -> Sign In / Up -> Email ->
--      turn OFF "Confirm email"  (easiest for testing - sign-ups work instantly)
--   2) Supabase Dashboard -> Authentication -> Email -> SMTP Settings ->
--      connect a provider (Resend, SendGrid, ...) so real emails are sent
--   3) Manually confirm each new user: Authentication -> Users -> user -> Confirm
-- ============================================================================

-- STEP 1 (safe): Preview which accounts are pending (unconfirmed).
select id, email, created_at, email_confirmed_at
from auth.users
where email_confirmed_at is null
  and deleted_at is null
order by created_at desc;

-- STEP 2a: Delete ONE specific pending account by email (uncomment + edit):
-- delete from auth.users
-- where lower(email) = 'your.email@gmail.com';

-- STEP 2b: OR delete ALL pending accounts in one shot (uncomment to run):
-- delete from auth.users
-- where email_confirmed_at is null
--   and deleted_at is null;
-- (profiles and attendance rows are removed automatically via ON DELETE CASCADE)