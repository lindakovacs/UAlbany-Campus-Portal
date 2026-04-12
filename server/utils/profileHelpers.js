/**
 * Parse JSON fields from profile object
 * @param {Object} profile - Profile object with potentially stringified JSON fields
 * @returns {Object} Profile with parsed JSON fields
 */
const parseProfileJSON = (profile) => {
  if (!profile) return profile;

  if (profile.skills && typeof profile.skills === 'string') {
    try {
      profile.skills = JSON.parse(profile.skills);
    } catch (e) {
      profile.skills = [];
    }
  }

  if (profile.social_links && typeof profile.social_links === 'string') {
    try {
      profile.social_links = JSON.parse(profile.social_links);
    } catch (e) {
      profile.social_links = {};
    }
  }

  return profile;
};

/**
 * Parse JSON fields for array of profiles
 * @param {Array} profiles - Array of profile objects
 * @returns {Array} Profiles with parsed JSON fields
 */
const parseProfilesJSON = (profiles) => {
  return profiles.map(parseProfileJSON);
};

module.exports = {
  parseProfileJSON,
  parseProfilesJSON,
};
