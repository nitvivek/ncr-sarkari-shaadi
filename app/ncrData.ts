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

// Government service cadres that are permanently headquartered in Delhi.
// NCRSarkariShaadi caters to members of these cadres; "Other" stays open-ended
// for eligible members whose cadre is not listed.
export const serviceCadres = [
  'Central Secretariat Service (CSS)',
  "Central Secretariat Stenographers' Service (CSSS)",
  'Railway Board Secretariat Service (RBSS)',
  'Armed Forces Headquarters Civil Service (AFHQCS)',
  'Indian Foreign Service (IFS / MEA Assistant Cadre)',
  'Lok Sabha Secretariat Cadre',
  'Rajya Sabha Secretariat Cadre',
  'DANICS (Delhi, Andaman & Nicobar Islands Civil Service)',
  'DANIPS (Delhi, Andaman & Nicobar Islands Police Service)',
  'Delhi Development Authority (DDA)',
  'DASS (Delhi Administration Subordinate Service)',
  'GNCTDSS (Delhi State Subordinate Services)',
  'Municipal Corporation of Delhi (MCD) Cadre',
  'New Delhi Municipal Council (NDMC) Cadre',
  'Delhi Transport Corporation (DTC) Cadre',
  'Delhi Metro Rail Corporation (DMRC) Cadre',
  'Delhi Transco Limited (DTL) Cadre',
  'Other',
];
