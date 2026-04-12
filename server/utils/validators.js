// Email validation
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Password validation (min 8 chars)
const validatePassword = (password) => {
  return password && password.length >= 8;
};

// Name validation (2-100 chars)
const validateName = (name) => {
  return name && name.toString().length >= 2 && name.toString().length <= 100;
};

// Generic field length validator
const validateFieldLength = (field, min = 1, max = 255) => {
  return field && field.toString().length >= min && field.toString().length <= max;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateFieldLength,
};
