/**
 * Quick Profile API Test
 * Tests profile creation and editing workflow
 */

const BASE_URL = 'http://localhost:3001/api';

// Test user credentials
const testUser = {
  email: 'profiletest@test.com',
  password: 'TestPassword123!',
  name: 'Profile Test User',
};

let authToken = null;
let userId = null;

async function registerUser() {
  console.log('\n1. Registering test user...');
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const data = await response.json();
    if (response.ok) {
      console.log('✓ Registration successful');
      authToken = data.data.token;
      userId = data.data.id;
      console.log(`  Token: ${authToken.substring(0, 20)}...`);
      console.log(`  User ID: ${userId}`);
      return true;
    } else {
      console.log('✗ Registration failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('✗ Register error:', error.message);
    return false;
  }
}

async function createProfile() {
  console.log('\n2. Creating profile with all fields...');
  const profileData = {
    name: 'Profile Test User',
    title: 'Software Engineer',
    company: 'Tech Corp',
    status: 'Looking for opportunities',
    location: 'New York, NY',
    skills: 'JavaScript,React,Node.js,MongoDB',
    bio: 'Full-stack developer with 5 years of experience',
    githubusername: 'profiletest',
    social_links: {
      website: 'https://example.com',
      github: 'https://github.com/profiletest',
      linkedin: 'https://linkedin.com/in/profiletest',
      twitter: 'https://twitter.com/profiletest',
    },
  };

  try {
    const response = await fetch(`${BASE_URL}/profiles/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(profileData),
    });
    const data = await response.json();
    if (response.ok) {
      console.log('✓ Profile created successfully');
      console.log('  Response data fields:', Object.keys(data.data));
      return data.data;
    } else {
      console.log('✗ Profile creation failed:', data.message || data.error);
      console.log('  Status:', response.status);
      return null;
    }
  } catch (error) {
    console.error('✗ Create profile error:', error.message);
    return null;
  }
}

async function getProfile() {
  console.log('\n3. Fetching profile...');
  try {
    const response = await fetch(`${BASE_URL}/profiles/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      console.log('✓ Profile fetched successfully');
      const profileData = data.data;
      console.log('  Name:', profileData.name);
      console.log('  Company:', profileData.company);
      console.log('  Location:', profileData.location);
      console.log('  Bio:', profileData.bio);
      console.log('  Skills:', profileData.skills);
      console.log('  Social links:', profileData.social_links);
      return profileData;
    } else {
      console.log('✗ Profile fetch failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('✗ Get profile error:', error.message);
    return null;
  }
}

async function updateProfile() {
  console.log('\n4. Updating profile...');
  const updated = {
    company: 'New Tech Company',
    location: 'San Francisco, CA',
    bio: 'Updated bio - now working at a new awesome company',
  };

  try {
    const response = await fetch(`${BASE_URL}/profiles/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(updated),
    });
    const data = await response.json();
    if (response.ok) {
      console.log('✓ Profile updated successfully');
      console.log('  Updated company:', data.data.company);
      console.log('  Updated location:', data.data.location);
      console.log('  Updated bio:', data.data.bio);
      return data.data;
    } else {
      console.log('✗ Profile update failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('✗ Update profile error:', error.message);
    return null;
  }
}

async function verifyUpdatePersisted() {
  console.log('\n5. Verifying update persisted...');
  try {
    const response = await fetch(`${BASE_URL}/profiles/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      const profileData = data.data;
      console.log('✓ Profile verification successful');
      console.log('  Company:', profileData.company);
      console.log('  Location:', profileData.location);
      console.log('  Bio:', profileData.bio);

      // Verify updates
      if (
        profileData.company === 'New Tech Company' &&
        profileData.location === 'San Francisco, CA' &&
        profileData.bio.includes('now working at a new awesome company')
      ) {
        console.log('✓ All updates persisted correctly!');
        return true;
      } else {
        console.log('✗ Updates did not persist correctly');
        return false;
      }
    } else {
      console.log('✗ Profile verification failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('✗ Verify error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('========================================');
  console.log('  PROFILE API INTEGRATION TEST');
  console.log('========================================');

  const registered = await registerUser();
  if (!registered) {
    console.log('\n✗ TEST FAILED: Could not register user');
    process.exit(1);
  }

  const created = await createProfile();
  if (!created) {
    console.log('\n✗ TEST FAILED: Could not create profile');
    process.exit(1);
  }

  const fetched = await getProfile();
  if (!fetched) {
    console.log('\n✗ TEST FAILED: Could not fetch profile');
    process.exit(1);
  }

  const updated = await updateProfile();
  if (!updated) {
    console.log('\n✗ TEST FAILED: Could not update profile');
    process.exit(1);
  }

  const verified = await verifyUpdatePersisted();
  if (!verified) {
    console.log('\n✗ TEST FAILED: Updates did not persist');
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('✓ ALL TESTS PASSED! Profile API working correctly');
  console.log('========================================\n');
  process.exit(0);
}

runTests();
