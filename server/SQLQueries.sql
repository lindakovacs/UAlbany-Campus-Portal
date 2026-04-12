-- =====================================================
-- UAlbany Campus Portal - SQL Queries for Testing
-- =====================================================

-- Use the database
USE ualbany_campus;

-- =====================================================
-- 1. USERS TABLE QUERIES
-- =====================================================

-- View all users
SELECT * FROM users;

-- Get user count
SELECT COUNT(*) as total_users FROM users;

-- Get specific user by email
SELECT * FROM users WHERE email = 'user@example.com';

-- =====================================================
-- 2. PROFILES TABLE QUERIES
-- =====================================================

-- View all user profiles
SELECT * FROM profiles;

-- Get profile with user details
SELECT u.id, u.name, u.email, p.bio, p.company, p.location, p.skills
FROM profiles p
JOIN users u ON p.user_id = u.id;

-- Get profile count
SELECT COUNT(*) as total_profiles FROM profiles;

-- =====================================================
-- 3. POSTS TABLE QUERIES
-- =====================================================

-- View all posts
SELECT * FROM posts;

-- Get posts with user details
SELECT p.id, p.text, p.created_at, u.name, u.email
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;

-- Get post count
SELECT COUNT(*) as total_posts FROM posts;

-- Get posts by specific user
SELECT * FROM posts WHERE user_id = 1 ORDER BY created_at DESC;

-- Get most recent 10 posts
SELECT p.id, p.text, p.created_at, u.name
FROM posts p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- =====================================================
-- 4. COMMENTS TABLE QUERIES
-- =====================================================

-- View all comments
SELECT * FROM comments;

-- Get comments with user and post details
SELECT c.id, c.text, c.created_at, u.name, p.text as post_text
FROM comments c
JOIN users u ON c.user_id = u.id
JOIN posts p ON c.post_id = p.id
ORDER BY c.created_at DESC;

-- Get comment count
SELECT COUNT(*) as total_comments FROM comments;

-- Get comments for specific post
SELECT c.id, c.text, c.created_at, u.name
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE c.post_id = 1
ORDER BY c.created_at ASC;

-- =====================================================
-- 5. LIKES TABLE QUERIES
-- =====================================================

-- View all likes
SELECT * FROM likes;

-- Get likes with user and post details
SELECT l.id, u.name, p.text, l.created_at
FROM likes l
JOIN users u ON l.user_id = u.id
JOIN posts p ON l.post_id = p.id
ORDER BY l.created_at DESC;

-- Get like count
SELECT COUNT(*) as total_likes FROM likes;

-- Get likes count per post
SELECT p.id, p.text, COUNT(l.id) as like_count
FROM posts p
LEFT JOIN likes l ON p.id = l.post_id
GROUP BY p.id, p.text
ORDER BY like_count DESC;

-- Check if specific user liked a post
SELECT * FROM likes WHERE user_id = 1 AND post_id = 1;

-- =====================================================
-- 6. EDUCATION TABLE QUERIES
-- =====================================================

-- View all education records
SELECT * FROM education;

-- Get education with user details
SELECT e.id, e.school, e.degree, e.field_of_study, e.from_date, e.to_date, u.name
FROM education e
JOIN users u ON e.user_id = u.id
ORDER BY e.from_date DESC;

-- Get education count
SELECT COUNT(*) as total_education_records FROM education;

-- Get education for specific user
SELECT * FROM education WHERE user_id = 1 ORDER BY from_date DESC;

-- =====================================================
-- 7. EXPERIENCE TABLE QUERIES
-- =====================================================

-- View all experience records
SELECT * FROM experience;

-- Get experience with user details
SELECT e.id, e.company, e.title, e.location, e.from_date, e.to_date, u.name
FROM experience e
JOIN users u ON e.user_id = u.id
ORDER BY e.from_date DESC;

-- Get experience count
SELECT COUNT(*) as total_experience_records FROM experience;

-- Get experience for specific user
SELECT * FROM experience WHERE user_id = 1 ORDER BY from_date DESC;

-- =====================================================
-- 8. COMPREHENSIVE DASHBOARD QUERIES
-- =====================================================

-- Get user engagement stats
SELECT 
  u.name,
  u.email,
  COUNT(DISTINCT p.id) as post_count,
  COUNT(DISTINCT c.id) as comment_count,
  COUNT(DISTINCT l.id) as like_count,
  COUNT(DISTINCT ed.id) as education_count,
  COUNT(DISTINCT exp.id) as experience_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN comments c ON u.id = c.user_id
LEFT JOIN likes l ON u.id = l.user_id
LEFT JOIN education ed ON u.id = ed.user_id
LEFT JOIN experience exp ON u.id = exp.user_id
GROUP BY u.id, u.name, u.email;

-- Get all tables row counts at once
SELECT 
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'likes', COUNT(*) FROM likes
UNION ALL
SELECT 'education', COUNT(*) FROM education
UNION ALL
SELECT 'experience', COUNT(*) FROM experience;

-- =====================================================
-- 9. TABLE STRUCTURE QUERIES
-- =====================================================

-- View table structure
DESCRIBE users;
DESCRIBE profiles;
DESCRIBE posts;
DESCRIBE comments;
DESCRIBE likes;
DESCRIBE education;
DESCRIBE experience;

-- Get all table information
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'ualbany_campus';
