export const TITHI_NAMES = [
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
] as const;

export const LUNAR_MONTHS = [
  "Chaitra",
  "Vaishakha",
  "Jyeshtha",
  "Ashadha",
  "Shravana",
  "Bhadrapada",
  "Ashwin",
  "Kartika",
  "Margashirsha",
  "Pausha",
  "Magha",
  "Phalguna",
] as const;

export const SYNODIC_MONTH_DAYS = 29.530588;

/** Years of annual tithi shraddha to publish after the date of passing. */
export const ANNUAL_SHRADDHA_YEARS = 12;

/** Lahiri (Chitrapaksha) ayanamsa at J2000.0, degrees. */
export const LAHIRI_AYANAMSA_J2000 = 23.853396667;

/** Lahiri precession rate, arcseconds per year. */
export const LAHIRI_RATE_ARCSEC_PER_YEAR = 50.2388475;
