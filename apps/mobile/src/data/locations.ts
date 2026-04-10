/**
 * Country and city data for location dropdowns.
 * Cities are grouped by country. Users select country first, then city.
 */

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface City {
  name: string;
  countryCode: string;
}

export const COUNTRIES: Country[] = [
  { code: 'ET', name: 'Ethiopia', flag: '\u{1F1EA}\u{1F1F9}' },
  { code: 'US', name: 'United States', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'CA', name: 'Canada', flag: '\u{1F1E8}\u{1F1E6}' },
  { code: 'GB', name: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'DE', name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: 'SE', name: 'Sweden', flag: '\u{1F1F8}\u{1F1EA}' },
  { code: 'NO', name: 'Norway', flag: '\u{1F1F3}\u{1F1F4}' },
  { code: 'AE', name: 'United Arab Emirates', flag: '\u{1F1E6}\u{1F1EA}' },
  { code: 'SA', name: 'Saudi Arabia', flag: '\u{1F1F8}\u{1F1E6}' },
  { code: 'KE', name: 'Kenya', flag: '\u{1F1F0}\u{1F1EA}' },
  { code: 'ZA', name: 'South Africa', flag: '\u{1F1FF}\u{1F1E6}' },
  { code: 'AU', name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}' },
  { code: 'IL', name: 'Israel', flag: '\u{1F1EE}\u{1F1F1}' },
  { code: 'IT', name: 'Italy', flag: '\u{1F1EE}\u{1F1F9}' },
  { code: 'FR', name: 'France', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: 'NL', name: 'Netherlands', flag: '\u{1F1F3}\u{1F1F1}' },
  { code: 'DJ', name: 'Djibouti', flag: '\u{1F1E9}\u{1F1EF}' },
  { code: 'ER', name: 'Eritrea', flag: '\u{1F1EA}\u{1F1F7}' },
  { code: 'SD', name: 'Sudan', flag: '\u{1F1F8}\u{1F1E9}' },
];

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  ET: [
    'Addis Ababa', 'Dire Dawa', 'Mekelle', 'Adama', 'Gondar',
    'Hawassa', 'Bahir Dar', 'Jimma', 'Dessie', 'Jijiga',
    'Harar', 'Shashamane', 'Bishoftu', 'Sodo', 'Arba Minch',
    'Hosaena', 'Woldia', 'Debre Markos', 'Debre Berhan', 'Nekemte',
    'Asella', 'Dilla', 'Gambela', 'Axum', 'Lalibela',
  ],
  US: [
    'Washington DC', 'New York', 'Los Angeles', 'Chicago', 'Houston',
    'Dallas', 'Atlanta', 'Seattle', 'Denver', 'Minneapolis',
    'Columbus', 'San Jose', 'San Diego', 'Las Vegas', 'Phoenix',
    'Portland', 'Charlotte', 'Nashville', 'Austin', 'Miami',
  ],
  CA: [
    'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton',
    'Ottawa', 'Winnipeg', 'Hamilton', 'London', 'Halifax',
  ],
  GB: [
    'London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol',
    'Edinburgh', 'Glasgow', 'Liverpool', 'Sheffield', 'Leicester',
  ],
  DE: [
    'Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne',
    'Stuttgart', 'Dusseldorf', 'Dortmund', 'Leipzig', 'Nuremberg',
  ],
  SE: [
    'Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Linköping',
  ],
  NO: [
    'Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen',
  ],
  AE: [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain',
  ],
  SA: [
    'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam',
  ],
  KE: [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  ],
  ZA: [
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
  ],
  AU: [
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide',
  ],
  IL: [
    'Tel Aviv', 'Jerusalem', 'Haifa', 'Netanya', 'Beersheba',
  ],
  IT: [
    'Rome', 'Milan', 'Naples', 'Turin', 'Florence',
  ],
  FR: [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice',
  ],
  NL: [
    'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven',
  ],
  DJ: [
    'Djibouti City', 'Ali Sabieh', 'Tadjoura', 'Obock', 'Dikhil',
  ],
  ER: [
    'Asmara', 'Keren', 'Massawa', 'Assab', 'Mendefera',
  ],
  SD: [
    'Khartoum', 'Omdurman', 'Port Sudan', 'Kassala', 'Wad Madani',
  ],
};

export function getCitiesForCountry(countryCode: string): string[] {
  return CITIES_BY_COUNTRY[countryCode] ?? [];
}
