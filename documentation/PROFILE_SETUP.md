# Profile Setup & Configuration Guide

## Overview

The UAlbany Campus Portal provides comprehensive user profile management with support for profile information, photos, education history, work experience, and social media links. This guide covers setting up and managing user profiles.

## User Profile Components

### Basic Profile Information

Every user profile includes:
- **Name** - User's full name
- **Title** - Professional/academic title
- **Company** - Current organization
- **Location** - City, State/Country
- **Bio** - Short biography (max 500 characters)
- **Website** - Personal or professional website URL
- **Skills** - Array of professional skills (stored as JSON)
- **Social Links** - GitHub, Twitter, LinkedIn, Facebook, YouTube, Instagram

### Database Schema

```sql
CREATE TABLE profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  title VARCHAR(255),
  company VARCHAR(255),
  website VARCHAR(500),
  location VARCHAR(255),
  bio VARCHAR(2000),
  skills JSON,
  social_links JSON,
  profile_photo LONGTEXT COMMENT 'Base64 encoded profile photo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Profile Photo Storage

Profile photos are now stored in the database and synced across all users' posts and comments.

### Features

- Photos stored as base64 encoded data in `profiles.profile_photo` column
- Automatic sync when users upload photos to their profile
- Photos displayed in all posts and comments
- Graceful fallback to Gravatar if photo not set
- Persistent storage across browser sessions

### How It Works

1. **User uploads photo** on their profile page
2. **Frontend stores it** in localStorage for instant display
3. **Frontend uploads to server** via `/api/profiles/photo/upload` endpoint
4. **Server stores in database** as base64 in `profiles.profile_photo` column
5. **Posts/comments API** includes the profile photo in responses
6. **All users see** the profile photo instead of Gravatar

### Database Migration

If you have an existing database without the `profile_photo` column, run:

```sql
ALTER TABLE profiles ADD COLUMN profile_photo LONGTEXT DEFAULT NULL COMMENT 'Base64 encoded profile photo';
ALTER TABLE profiles ADD KEY idx_user_id (user_id);
```

Or use the init script (already includes this):

```bash
mysql -h localhost -u root -p your_password < server/scripts/init-db.sql
```

### Photo Upload Endpoint

**Route:** `POST /api/profiles/photo/upload`
**Authentication:** Required (JWT token)
**Content-Type:** application/json

**Request Body:**
```json
{
  "photoData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Profile photo updated successfully",
  "data": {
    "user_id": 1,
    "photo_updated": true
  }
}
```

### Size Limits

- **Maximum encoded size:** ~2MB
- **Recommended:** Keep photos under 500KB when encoded
- **Format:** Base64 data URLs (data:image/jpeg;base64,...)

### Testing Profile Photos

1. Navigate to your profile page (`profile.html`)
2. Upload a profile photo using the profile editor
3. Check browser console for upload confirmation
4. Create a new post - it should display your profile photo
5. Comment on another post - your photo should appear in the comment
6. Reload the page - photo should persist from database

## Backend API Endpoints

### Get Profile

**Route:** `GET /api/profiles/:userId`
**Authentication:** Not required
**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "user_id": 1,
    "title": "Software Engineer",
    "company": "Tech Company",
    "location": "Albany, NY",
    "bio": "Passionate about web development",
    "skills": ["JavaScript", "React", "Node.js"],
    "social_links": {
      "github": "github.com/username",
      "linkedin": "linkedin.com/in/username"
    },
    "profile_photo": "data:image/jpeg;base64,..."
  }
}
```

### Update Profile

**Route:** `PUT /api/profiles/:userId`
**Authentication:** Required (owner only)
**Request Body:**
```json
{
  "title": "Senior Developer",
  "company": "New Company",
  "location": "New York, NY",
  "bio": "Updated bio",
  "skills": ["JavaScript", "React", "Node.js", "Python"],
  "social_links": {
    "github": "github.com/newusername",
    "linkedin": "linkedin.com/in/newusername"
  }
}
```

### Upload Profile Photo

**Route:** `POST /api/profiles/photo/upload`
**Authentication:** Required (JWT token)
**Request Body:**
```json
{
  "photoData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

### List All Profiles

**Route:** `GET /api/profiles?page=1&limit=20`
**Authentication:** Not required
**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 50)

## Frontend Integration

### API Client Usage

```javascript
// Upload profile photo
await apiClient.profiles.uploadPhoto(photoData);

// Get profile
const profile = await apiClient.profiles.get(userId);

// Update profile
await apiClient.profiles.update({
  title: "New Title",
  bio: "Updated bio"
});

// Get all profiles
const profiles = await apiClient.profiles.getAll(page, limit);
```

### JavaScript Modules

**profile-edit.js:**
- Handles profile editing UI
- Saves changes to localStorage
- Auto-uploads profile photos to server
- Syncs experience and education records

**posts-feed.js:**
- Displays posts with profile photos from API
- Falls back to Gravatar if photo not available
- Handles likes and post deletion

**post-detail.js:**
- Displays individual post with comments
- Shows profile photos for post author and commenters
- Manages comment creation and deletion

## Files Modified/Created

### Backend
- `server/controllers/profileController.js` - Added `uploadProfilePhoto()` function
- `server/routes/profiles.js` - Added photo upload endpoint
- `server/controllers/postController.js` - Updated to include profile_photo
- `server/controllers/commentController.js` - Updated to include profile_photo
- `server/scripts/init-db.sql` - Added profile_photo column to schema

### Frontend
- `frontend/js/api-client.js` - Added `profiles.uploadPhoto()` method
- `js/profile-edit.js` - Added auto-upload on photo selection
- `js/posts-feed.js` - Updated to display profile photos
- `js/post-detail.js` - Updated to display profile photos in posts and comments

## Error Handling

### Common Issues

**Photo upload fails silently:**
- Check browser console for error messages
- Verify photo is valid base64 data URL
- Ensure server is running and accessible
- Confirm JWT token is valid and not expired

**Photos not showing in posts/comments:**
- Verify profile_photo column exists in profiles table
- Check database migration was run
- Clear browser cache and reload
- Ensure API returns profile_photo in response

**Cannot update profile:**
- Verify you're updating your own profile (401 error if not)
- Check JWT token is sent in Authorization header
- Verify profile exists (auto-created on first update)
- Check request body format matches API spec

## Performance Considerations

- Profile photos stored as base64 in LONGTEXT column
- Indexed on user_id for faster lookups
- Photos included in posts/comments API responses (consider pagination for large datasets)
- Consider implementing photo compression for production use

## Security Notes

- Photos validated for format (base64 data URLs only)
- Size limit enforced (~2MB for safety)
- Profile updates require authentication (owner only)
- Input validation on all text fields
- XSS prevention for photo display

## Next Steps

1. Ensure database migration has been run
2. Upload a test profile photo to verify functionality
3. Check posts feed displays photos correctly
4. Monitor console for any errors or warnings
