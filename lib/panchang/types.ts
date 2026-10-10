export type Paksha = "Shukla" | "Krishna";
export type CalendarSystem = "purnimanta" | "amanta";
export type DateInputCalendar = "ad" | "bs";

export interface GeoLocation {
  id: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  aliases?: string[];
}

export interface TithiInfo {
  index: number;
  number: number;
  name: string;
  paksha: Paksha;
  elongation: number;
}

export interface MasaInfo {
  index: number;
  name: string;
  adhik: boolean;
  system: CalendarSystem;
  amantaIndex: number;
  amantaName: string;
}

export interface PanchangMoment {
  at: Date;
  tithi: TithiInfo;
  masa: MasaInfo;
  displayName: string;
}

export interface DayPanchang extends PanchangMoment {
  civilDate: string;
  sunrise: Date;
  sunset: Date;
  aparahnaStart: Date;
  aparahnaEnd: Date;
  aparahnaMid: Date;
}

export interface Milestone {
  id: string;
  kind:
    | "kriya"
    | "masik"
    | "barkhi"
    | "barshik"
    | "annual"
    | "civil";
  title: string;
  subtitle: string;
  date: Date;
  civilDate: string;
  nepaliDate: string;
  tithiName: string;
  notes: string;
  yearIndex?: number;
}

export interface AdhikShift {
  occurred: boolean;
  months: string[];
  daysShifted: number;
}

export interface CalculationInput {
  dateOfPassing: string;
  timeOfPassing: string;
  timeUnknown: boolean;
  location: GeoLocation;
  calendar: CalendarSystem;
  dateInputCalendar: DateInputCalendar;
}

export interface CalculationResult {
  input: CalculationInput;
  deathMoment: Date;
  deathPanchang: PanchangMoment;
  deathNepaliDate: string;
  barshik: Milestone;
  civilAnniversary: Milestone;
  kriya: Milestone;
  barkhi: Milestone;
  masik: Milestone[];
  annualShraddha: Milestone[];
  nextAnnual: Milestone | null;
  timeline: Milestone[];
  adhik: AdhikShift;
  explanation: string[];
}
