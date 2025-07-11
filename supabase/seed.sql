-- This script is used to seed your database with initial data.
-- It's perfect for setting up a consistent development and testing environment.

-- 1. Create Sample Users
-- Note: Passwords are 'password' for all users.
-- Supabase automatically hashes them.

-- Admin User
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token_encrypted)
VALUES ('00000000-0000-0000-0000-000000000000', 'a0a0a0a0-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@vai.com', crypt('password', gen_salt('bf')), '2024-01-01 00:00:00+00', 'recoverytoken', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', '{"provider":"email","providers":["email"]}', '{"username":"admin_user"}', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', 'confirmationtoken', '', '', 'recoverytokenencrypted');

-- Premium User
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token_encrypted)
VALUES ('00000000-0000-0000-0000-000000000000', 'b0b0b0b0-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'premium@vai.com', crypt('password', gen_salt('bf')), '2024-01-01 00:00:00+00', 'recoverytoken', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', '{"provider":"email","providers":["email"]}', '{"username":"premium_user"}', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', 'confirmationtoken', '', '', 'recoverytokenencrypted');

-- Free User
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token_encrypted)
VALUES ('00000000-0000-0000-0000-000000000000', 'c0c0c0c0-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'free@vai.com', crypt('password', gen_salt('bf')), '2024-01-01 00:00:00+00', 'recoverytoken', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', '{"provider":"email","providers":["email"]}', '{"username":"free_user"}', '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', 'confirmationtoken', '', '', 'recoverytokenencrypted');

-- 2. Create Corresponding Profiles
-- This will be handled by the `handle_new_user` trigger you already have.
-- We just need to set their roles and full names.
UPDATE public.profiles SET role = 'admin', full_name = 'Admin User' WHERE id = 'a0a0a0a0-0000-0000-0000-000000000001';
UPDATE public.profiles SET role = 'premium', full_name = 'Premium VA' WHERE id = 'b0b0b0b0-0000-0000-0000-000000000002';
UPDATE public.profiles SET role = 'free', full_name = 'Free VA' WHERE id = 'c0c0c0c0-0000-0000-0000-000000000003';

-- 3. Create Sample Courses
INSERT INTO public.courses (id, title, description, is_premium, image_url) VALUES
('d0d0d0d0-0000-0000-0000-000000000001', 'Intro to Virtual Assistance', 'Learn the fundamentals of being a successful VA.', false, 'https://placehold.co/600x400/3B82F6/FFFFFF?text=Free+Course'),
('e0e0e0e0-0000-0000-0000-000000000002', 'Advanced Social Media Management', 'Master the art of social media for clients.', true, 'https://placehold.co/600x400/FBBF24/000000?text=Premium+Course');

-- 4. Create Sample Lessons for the Courses
-- Free Course Lessons
INSERT INTO public.lessons (course_id, title, "order") VALUES
('d0d0d0d0-0000-0000-0000-000000000001', 'What is a VA?', 1),
('d0d0d0d0-0000-0000-0000-000000000001', 'Setting up your workspace', 2),
('d0d0d0d0-0000-0000-0000-000000000001', 'Client Communication 101', 3);

-- Premium Course Lessons
INSERT INTO public.lessons (course_id, title, "order") VALUES
('e0e0e0e0-0000-0000-0000-000000000002', 'Platform Deep Dive: Facebook & Instagram', 1),
('e0e0e0e0-0000-0000-0000-000000000002', 'Content Strategy & Calendars', 2),
('e0e0e0e0-0000-0000-0000-000000000002', 'Analytics and Reporting', 3),
('e0e0e0e0-0000-0000-0000-000000000002', 'Running Ad Campaigns', 4);

-- 5. Create a Sample Service Listing for the Premium User
INSERT INTO public.services (user_id, title, description, price, price_unit, image_url) VALUES
('b0b0b0b0-0000-0000-0000-000000000002', 'Expert Social Media Management', 'I will manage your social media channels to grow your audience and engagement.', 45.00, 'per_hour', 'premium_user/service_image.png');

-- Note: You would need to manually upload a corresponding image to the 'services' storage bucket
-- at the path 'premium_user/service_image.png' for this to display correctly.