/**
 * Format utilities for Tulumbak
 */

// Turkish Lira formatting
export function formatTL(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format weight with unit
export function formatWeight(weight: number): string {
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(1)} kg`;
  }
  return `${weight} gr`;
}

// Format date to Turkish locale
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj);
}

// Format time to Turkish locale
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

// Format date and time together
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

// Format phone number to Turkish format
export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a Turkish number
  if (cleaned.startsWith('90') && cleaned.length === 11) {
    return `+90 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  // Return original if format doesn't match
  return phone;
}

// Format quantity with proper Turkish suffix
export function formatQuantity(quantity: number, unit: string = 'adet'): string {
  return `${quantity} ${unit}`;
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value}%`;
}

// Format distance
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

// Slugify text for URLs
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Generate unique ID
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

// Validate Turkish phone number
export function isValidTurkishPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.startsWith('90') && cleaned.length === 11;
}

// Validate Turkish ID number (TCKN)
export function isValidTCKN(tckn: string): boolean {
  if (!/^\d{11}$/.test(tckn)) return false;
  
  // Basic TCKN validation algorithm
  const digits = tckn.split('').map(Number);
  const tenthDigit = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7 - 
                    (digits[1] + digits[3] + digits[5] + digits[7]);
  const tenthDigitMod = tenthDigit % 10;
  const eleventhDigit = (digits[0] + digits[1] + digits[2] + digits[3] + digits[4] + 
                        digits[5] + digits[6] + digits[7] + digits[8] + digits[9]) % 10;
  
  return digits[9] === tenthDigitMod && digits[10] === eleventhDigit;
}

// Validate Turkish Tax ID number (VKN)
export function isValidVKN(vkn: string): boolean {
  if (!/^\d{10}$/.test(vkn)) return false;
  
  // Basic VKN validation (simplified)
  const digits = vkn.split('').map(Number);
  const lastDigit = digits[9];
  const sum = digits.slice(0, 9).reduce((acc, digit, index) => {
    return acc + (digit * (index + 1));
  }, 0);
  
  return sum % 10 === lastDigit;
}
