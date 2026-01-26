/**
 * Generate a random 6-digit OTP code
 */
export const generateOTP = (): string => {
  // Generate random 6-digit number (100000 to 999999)
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

/**
 * Get OTP expiry time (5 minutes from now)
 */
export const getOTPExpiry = (): Date => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5);
  return expiry;
};

/**
 * Check if OTP has expired
 */
export const isOTPExpired = (expiryDate: Date): boolean => {
  return new Date() > new Date(expiryDate);
};

/**
 * Validate OTP format (must be 6 digits)
 */
export const isValidOTPFormat = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};
