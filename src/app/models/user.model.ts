export interface User {
  uid: string;
  email: string;
  premium?: boolean;
  gender?: string;
  displayName?: string;
  birthdate?: Date;
  languages?: [];
  height?: number;
  bodyType?: string;
  eyes?: string;
  hair?: string;
  lookingFor?: [];
  aboutMe?: string;
  country?: string;
  state?: string;
  city?: string;
  url?: string;
  filePath?: string;
  userVisitedMeCounterOld?: number;
  userVisitedMeCounterCurrent?: number;
  toVisit?: [];
  lastActivity?: number;
  admin?: boolean;
}
