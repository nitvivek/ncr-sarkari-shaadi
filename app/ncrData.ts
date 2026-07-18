// Official National Capital Region (NCR) districts per the NCR Planning Board.
// Grouped by state for the onboarding dropdown; the core hubs are listed first.

export type NcrDistrictGroup = { state: string; districts: string[] };

export const coreNcrHubs = ['Delhi', 'Gurugram', 'Noida', 'Greater Noida', 'Ghaziabad', 'Faridabad'];

export const ncrDistrictGroups: NcrDistrictGroup[] = [
  { state: 'Delhi', districts: ['Delhi (NCT)'] },
  {
    state: 'Haryana',
    districts: [
      'Gurugram',
      'Faridabad',
      'Sonipat',
      'Rohtak',
      'Jhajjar',
      'Panipat',
      'Palwal',
      'Rewari',
      'Nuh',
      'Bhiwani',
      'Charkhi Dadri',
      'Mahendragarh',
      'Jind',
      'Karnal',
    ],
  },
  {
    state: 'Uttar Pradesh',
    districts: [
      'Gautam Buddh Nagar (Noida / Greater Noida)',
      'Ghaziabad',
      'Meerut',
      'Hapur',
      'Bulandshahr',
      'Baghpat',
      'Muzaffarnagar',
      'Shamli',
    ],
  },
  { state: 'Rajasthan', districts: ['Alwar', 'Bharatpur'] },
];

export const allNcrDistricts = ncrDistrictGroups.flatMap((group) => group.districts);
