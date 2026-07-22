// Data-driven schema for the expanded matrimony profile (Phase A: frontend).
// Sensitive fields (complexion, body type, caste) are captured as optional
// profile fields but must NEVER be used as search/match filters.

export type FieldType = 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'radio' | 'date';
export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  hint?: string;
  lock?: boolean;      // set once, then immutable (edit via support)
  optional?: boolean;  // does not count toward completion
  backed?: boolean;    // already persisted to /api/profile today
  weight?: number;     // completion contribution (default 1 if not optional)
};
export type SectionDef = { id: string; title: string; icon: string; desc: string; fields: FieldDef[] };

// ---- option lists ----
const heights: string[] = (() => {
  const out: string[] = [];
  for (let ft = 4; ft <= 7; ft++) for (let inch = 0; inch <= 11; inch++) {
    if (ft === 4 && inch < 6) continue;
    if (ft === 7 && inch > 0) break;
    const cm = Math.round((ft * 12 + inch) * 2.54);
    out.push(`${ft}'${inch}" (${cm} cm)`);
  }
  return out;
})();
const maritalStatus = ['Never married', 'Divorced', 'Widowed', 'Separated', 'Awaiting divorce'];
const motherTongues = ['Hindi', 'Punjabi', 'Urdu', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Odia', 'Assamese', 'Bhojpuri', 'Haryanvi', 'Rajasthani', 'Kashmiri', 'Konkani', 'English', 'Other'];
const diet = ['Vegetarian', 'Non-vegetarian', 'Eggetarian', 'Vegan', 'Jain'];
const drink = ['No', 'Socially', 'Yes'];
const smoke = ['No', 'Occasionally', 'Yes'];
const bodyType = ['Slim', 'Average', 'Athletic', 'Heavy'];
const complexion = ['Fair', 'Wheatish', 'Dusky', 'Dark'];
const physicalStatus = ['Normal', 'Differently-abled'];
const bloodGroup = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Don’t know'];
const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Jewish', 'Spiritual', 'No religion', 'Other'];
const casteNoBar = ['No bar / Caste no bar', 'Brahmin', 'Rajput', 'Agarwal', 'Kayastha', 'Jat', 'Khatri', 'Baniya', 'Yadav', 'Gupta', 'Maratha', 'Nair', 'Reddy', 'Other'];
const education = ['High school', 'Diploma', 'Bachelor’s degree', 'Master’s degree', 'Doctorate / PhD', 'Professional (CA / CS / CMA)', 'Medical (MBBS / MD)', 'Law (LLB / LLM)', 'Other'];
const incomeBands = ['Prefer not to say', 'Up to ₹5 L', '₹5–10 L', '₹10–15 L', '₹15–25 L', '₹25–50 L', '₹50 L+'];
const familyType = ['Nuclear', 'Joint'];
const familyValues = ['Traditional', 'Moderate', 'Liberal'];
const familyStatus = ['Middle class', 'Upper middle class', 'Affluent'];
const parentStatus = ['Employed', 'Retired', 'Homemaker', 'Business', 'Not employed', 'Passed away'];
const counts = ['0', '1', '2', '3', '4', '5+'];
const rashi = ['Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)', 'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'];
const nakshatra = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];
const manglik = ['No', 'Yes', 'Don’t know'];
const relocate = ['Prefer to stay in NCR', 'Open to discussion', 'Willing to relocate'];
export const hobbies = ['Reading', 'Music', 'Travel', 'Cooking', 'Fitness / gym', 'Yoga', 'Cricket', 'Films & OTT', 'Photography', 'Writing', 'Gardening', 'Art & craft', 'Trekking', 'Social work', 'Cooking', 'Spirituality'];

export const profileSections: SectionDef[] = [
  { id: 'basics', title: 'Basics', icon: 'user', desc: 'Core identity — some of these can be set only once.', fields: [
    { key: 'created_for', label: 'Profile created for', type: 'select', options: ['Myself', 'My son', 'My daughter', 'My brother', 'My sister', 'A relative', 'A friend'], backed: true },
    { key: 'gender', label: 'Gender', type: 'radio', options: ['Male', 'Female'], backed: true, lock: true },
    { key: 'dob', label: 'Date of birth', type: 'date', lock: true, hint: 'Used to calculate age. Cannot be changed later.' },
    { key: 'marital_status', label: 'Marital status', type: 'select', options: maritalStatus },
    { key: 'height', label: 'Height', type: 'select', options: heights, lock: true },
    { key: 'mother_tongue', label: 'Mother tongue', type: 'select', options: motherTongues, lock: true },
  ] },
  { id: 'lifestyle', title: 'Appearance & lifestyle', icon: 'spark', desc: 'Optional details that help matches picture your day-to-day.', fields: [
    { key: 'about', label: 'About me', type: 'textarea', backed: true, placeholder: 'Your values, interests, and what a shared life looks like…', weight: 2 },
    { key: 'diet', label: 'Diet', type: 'select', options: diet },
    { key: 'drink', label: 'Drinking', type: 'select', options: drink },
    { key: 'smoke', label: 'Smoking', type: 'select', options: smoke },
    { key: 'hobbies', label: 'Hobbies & interests', type: 'multiselect', options: Array.from(new Set(hobbies)) },
    { key: 'body_type', label: 'Body type', type: 'select', options: bodyType, optional: true },
    { key: 'complexion', label: 'Complexion', type: 'select', options: complexion, optional: true },
    { key: 'physical_status', label: 'Physical status', type: 'radio', options: physicalStatus },
    { key: 'blood_group', label: 'Blood group', type: 'select', options: bloodGroup, optional: true },
  ] },
  { id: 'faith', title: 'Faith & community', icon: 'heart', desc: 'Share what matters to your family. Caste can be left as “No bar”.', fields: [
    { key: 'religion', label: 'Religion', type: 'select', options: religions, lock: true },
    { key: 'caste', label: 'Caste / community', type: 'select', options: casteNoBar, optional: true },
    { key: 'sub_caste', label: 'Sub-caste', type: 'text', optional: true },
    { key: 'gothra', label: 'Gothra', type: 'text', optional: true },
    { key: 'manglik', label: 'Manglik', type: 'radio', options: manglik },
  ] },
  { id: 'career', title: 'Education & service', icon: 'briefcase', desc: 'Your government service is your career — add education and level.', fields: [
    { key: 'service', label: 'Service / cadre', type: 'text', backed: true, hint: 'Set during onboarding — edit if needed.' },
    { key: 'highest_education', label: 'Highest education', type: 'select', options: education },
    { key: 'college', label: 'College / university', type: 'text', optional: true },
    { key: 'field_of_study', label: 'Field of study', type: 'text', optional: true },
    { key: 'designation', label: 'Designation / grade', type: 'text', optional: true },
    { key: 'annual_income', label: 'Annual income', type: 'select', options: incomeBands, optional: true },
  ] },
  { id: 'location', title: 'Location', icon: 'pin', desc: 'Where you are now and where home is.', fields: [
    { key: 'residence_city', label: 'Current NCR base', type: 'text', backed: true },
    { key: 'hometown', label: 'Hometown / native place', type: 'text' },
    { key: 'relocate', label: 'Willing to relocate', type: 'select', options: relocate },
  ] },
  { id: 'family', title: 'Family', icon: 'users', desc: 'Family details matter in matrimonial decisions.', fields: [
    { key: 'father_status', label: 'Father', type: 'select', options: parentStatus },
    { key: 'father_occupation', label: 'Father’s occupation', type: 'text', optional: true },
    { key: 'mother_status', label: 'Mother', type: 'select', options: parentStatus },
    { key: 'mother_occupation', label: 'Mother’s occupation', type: 'text', optional: true },
    { key: 'brothers', label: 'Brothers', type: 'select', options: counts },
    { key: 'brothers_married', label: 'Married brothers', type: 'select', options: counts, optional: true },
    { key: 'sisters', label: 'Sisters', type: 'select', options: counts },
    { key: 'sisters_married', label: 'Married sisters', type: 'select', options: counts, optional: true },
    { key: 'family_type', label: 'Family type', type: 'radio', options: familyType },
    { key: 'family_values', label: 'Family values', type: 'radio', options: familyValues },
    { key: 'family_status', label: 'Family status', type: 'select', options: familyStatus, optional: true },
    { key: 'about_family', label: 'About my family', type: 'textarea', optional: true, placeholder: 'A few lines about your family…' },
    { key: 'family_notes', label: 'Private family notes', type: 'textarea', backed: true, optional: true, hint: 'Only you can see this.' },
  ] },
  { id: 'horoscope', title: 'Horoscope', icon: 'clock', desc: 'For families who match kundlis. All optional.', fields: [
    { key: 'time_of_birth', label: 'Time of birth', type: 'text', optional: true, placeholder: 'e.g. 06:45 AM' },
    { key: 'place_of_birth', label: 'Place of birth', type: 'text', optional: true },
    { key: 'rashi', label: 'Rashi (moon sign)', type: 'select', options: rashi, optional: true },
    { key: 'nakshatra', label: 'Nakshatra (birth star)', type: 'select', options: nakshatra, optional: true },
    { key: 'kundli_matching', label: 'Open to kundli matching', type: 'radio', options: ['Yes', 'No', 'Optional'], optional: true },
  ] },
  { id: 'preferences', title: 'Partner preferences', icon: 'search', desc: 'What you’re looking for — powers your recommendations.', fields: [
    { key: 'pref_age', label: 'Preferred age range', type: 'text', placeholder: 'e.g. 28–34' },
    { key: 'pref_height', label: 'Preferred height range', type: 'text', optional: true, placeholder: 'e.g. 5\'2" – 5\'8"' },
    { key: 'pref_marital', label: 'Marital status', type: 'multiselect', options: maritalStatus },
    { key: 'pref_religion', label: 'Religion / community', type: 'text', optional: true, placeholder: 'e.g. Hindu, or No bar' },
    { key: 'pref_education', label: 'Education', type: 'multiselect', options: education, optional: true },
    { key: 'pref_diet', label: 'Diet', type: 'multiselect', options: diet, optional: true },
    { key: 'pref_location', label: 'Preferred NCR hubs', type: 'text', backed: true, placeholder: 'e.g. Delhi, Noida, Gurugram' },
    { key: 'pref_notes', label: 'What you’re looking for', type: 'textarea', placeholder: 'In your own words…' },
  ] },
];

export function completionTier(pct: number): { label: string; cls: string } {
  if (pct >= 90) return { label: 'Excellent', cls: 'tier--excellent' };
  if (pct >= 70) return { label: 'Good', cls: 'tier--good' };
  if (pct >= 40) return { label: 'Fair', cls: 'tier--fair' };
  return { label: 'Incomplete', cls: 'tier--incomplete' };
}

export function profileCompletion(values: Record<string, unknown>): number {
  let total = 0, got = 0;
  for (const section of profileSections) for (const f of section.fields) {
    if (f.optional) continue;
    const w = f.weight ?? 1;
    total += w;
    const v = values[f.key];
    if (Array.isArray(v) ? v.length > 0 : (v !== undefined && v !== null && String(v).trim() !== '')) got += w;
  }
  return total === 0 ? 0 : Math.round((got / total) * 100);
}

// keys that already persist to /api/profile today
export const backedKeys = profileSections.flatMap((s) => s.fields.filter((f) => f.backed).map((f) => f.key));

// pref_* keys persist to /api/preferences instead.
export const prefKeys = profileSections.find((s) => s.id === 'preferences')!.fields.map((f) => f.key);

// Phase A → Phase B: every remaining Phase A field is now persisted via
// /api/profile (Phase B schema accepts them). Everything except pref_*.
export const allKeys = profileSections.flatMap((s) => s.fields.map((f) => f.key));
export const migratedKeys = allKeys.filter((k) => !prefKeys.includes(k));
