// Seed 6 dummy test profiles (3 male + 3 female) against the live site.
// Run: node scripts/seed-profiles.mjs
// Requires: public/test-photos/1.png … 6.png and a placeholder PNG.
//
// Idempotent — if an email already exists, that user is skipped (and its
// profile/photo/verify are NOT overwritten). Re-running after a partial
// failure fills in only what was missing.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const BASE = process.env.SEED_BASE_URL ?? 'https://v2.ncrsarkarishaadi.workers.dev';
const __dirname = dirname(fileURLToPath(import.meta.url));
const PHOTOS_DIR = join(__dirname, '..', 'public', 'test-photos');

const PASSWORD = 'test1234abc!';
const ADMIN_EMAIL = 'vivek.ajnifm@gmail.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD; // optional: pass to auto-approve verifications

// Each user: every Phase A + B non-optional field populated. Optional fields
// populated where natural. Immutables set on first PUT.
const USERS = [
  {
    n: 1, login: 'aarav.m@ncr-tests.in', name: 'Aarav Mehta', gender: 'male',
    cadre: 'CSS', cadreCode: 'CSS · Section Officer',
    ministry: 'Ministry of Personnel, Public Grievances & Pensions',
    organisation: 'Department of Personnel & Training (DoPT)',
    city: 'New Delhi', hometown: 'Jaipur, Rajasthan', posting_outlook: 'Stable NCR posting',
    dob: '1990-04-12', height: `5'10" (178 cm)`,
    mother_tongue: 'Hindi', religion: 'Hindu', caste: 'No bar / Caste no bar',
    marital_status: 'Never married', diet: 'Vegetarian', drink: 'No', smoke: 'No',
    hobbies: ['Reading', 'Travel', 'Cricket', 'Films & OTT'],
    body_type: 'Athletic', complexion: 'Wheatish', physical_status: 'Normal', blood_group: 'B+',
    sub_caste: '', gothra: 'Kashyap', manglik: 'No',
    highest_education: 'Master’s degree', college: 'St. Stephen’s College, Delhi', field_of_study: 'Economics',
    designation: 'Section Officer', annual_income: '₹15–25 L',
    relocate: 'Prefer to stay in NCR',
    father_status: 'Retired', father_occupation: 'Retired Bank Manager (SBI)',
    mother_status: 'Homemaker', mother_occupation: '',
    brothers: '1', brothers_married: '1', sisters: '0', sisters_married: '0',
    family_type: 'Nuclear', family_values: 'Moderate', family_status: 'Upper middle class',
    about_family: 'Small, well-settled family from Jaipur. Father retired from SBI; mother is a homemaker. One elder brother, married and settled in Bengaluru.',
    about: 'I work at DoPT and love weekend cricket, slow Hindi films, and a quiet dinner with friends. Looking for someone who sees an NCR life as a beginning, not a compromise.',
    time_of_birth: '06:45 AM', place_of_birth: 'Jaipur', rashi: 'Mesha (Aries)', nakshatra: 'Ashwini',
    kundli_matching: 'Optional',
    preferred_hubs: 'Delhi, Noida, Gurugram',
    pref_age: '27–33', pref_height: `5'4" – 5'8"`,
    pref_marital: ['Never married'], pref_religion: 'Hindu, or No bar',
    pref_education: ['Master’s degree', 'Doctorate / PhD', 'Professional (CA / CS / CMA)'],
    pref_diet: ['Vegetarian', 'Jain'],
    pref_notes: 'Ideally a fellow CSS / central services officer or someone in a permanent Delhi posting. Shared rhythm matters more than background.',
  },
  {
    n: 2, login: 'rohan.k@ncr-tests.in', name: 'Rohan Kapoor', gender: 'male',
    cadre: 'DANICS', cadreCode: 'DANICS · Grade B',
    ministry: 'Ministry of Home Affairs', organisation: 'GNCTD — Revenue Department',
    city: 'Noida', hometown: 'Chandigarh', posting_outlook: 'Prefer stability in NCR',
    dob: '1992-09-03', height: `5'9" (175 cm)`,
    mother_tongue: 'Punjabi', religion: 'Hindu', caste: 'Khatri',
    marital_status: 'Never married', diet: 'Non-vegetarian', drink: 'Socially', smoke: 'No',
    hobbies: ['Fitness / gym', 'Travel', 'Photography', 'Music'],
    body_type: 'Athletic', complexion: 'Fair', physical_status: 'Normal', blood_group: 'O+',
    sub_caste: 'Khatri', gothra: 'Bharadwaj', manglik: 'No',
    highest_education: 'Bachelor’s degree', college: 'Hansraj College, Delhi', field_of_study: 'Commerce',
    designation: 'Assistant', annual_income: '₹10–15 L',
    relocate: 'Open to discussion',
    father_status: 'Retired', father_occupation: 'Retired Punjab Civil Secretariat Officer',
    mother_status: 'Homemaker', mother_occupation: '',
    brothers: '0', brothers_married: '0', sisters: '1', sisters_married: '0',
    family_type: 'Nuclear', family_values: 'Moderate', family_status: 'Upper middle class',
    about_family: 'Punjabi family rooted in Chandigarh. Father retired from Punjab Civil Secretariat; one younger sister, doing her Masters in Delhi.',
    about: 'Noida-based DANICS officer. Gym in the morning, work in Delhi, weekends in Chandigarh when I can. Looking for someone grounded, independent, with a sense of humour.',
    time_of_birth: '11:20 PM', place_of_birth: 'Chandigarh', rashi: 'Kanya (Virgo)', nakshatra: 'Hasta',
    kundli_matching: 'Yes',
    preferred_hubs: 'Noida, Delhi, Greater Noida',
    pref_age: '26–32', pref_height: `5'3" – 5'7"`,
    pref_marital: ['Never married'], pref_religion: 'Sikh, Hindu, or No bar',
    pref_education: ['Bachelor’s degree', 'Master’s degree', 'Professional (CA / CS / CMA)'],
    pref_diet: ['Vegetarian', 'Non-vegetarian', 'Eggetarian'],
    pref_notes: 'A fellow government officer or someone with a steady career. Noida / South Delhi preferred.',
  },
  {
    n: 3, login: 'vikram.s@ncr-tests.in', name: 'Vikram Singh', gender: 'male',
    cadre: 'IPS (Delhi)', cadreCode: 'IPS · DANIPS Cadre',
    ministry: 'Ministry of Home Affairs', organisation: 'Delhi Police',
    city: 'New Delhi', hometown: 'Lucknow, Uttar Pradesh', posting_outlook: 'Long-term Delhi posting',
    dob: '1988-12-22', height: `6'0" (183 cm)`,
    mother_tongue: 'Hindi', religion: 'Hindu', caste: 'Rajput',
    marital_status: 'Never married', diet: 'Non-vegetarian', drink: 'No', smoke: 'No',
    hobbies: ['Cricket', 'Trekking', 'Reading', 'Films & OTT'],
    body_type: 'Athletic', complexion: 'Wheatish', physical_status: 'Normal', blood_group: 'A+',
    sub_caste: 'Chauhan', gothra: 'Kashyap', manglik: 'No',
    highest_education: 'Master’s degree', college: 'IIT Delhi', field_of_study: 'Civil Engineering',
    designation: 'Superintendent of Police', annual_income: '₹25–50 L',
    relocate: 'Prefer to stay in NCR',
    father_status: 'Retired', father_occupation: 'Retired IPS Officer (UP Cadre)',
    mother_status: 'Homemaker', mother_occupation: '',
    brothers: '2', brothers_married: '2', sisters: '0', sisters_married: '0',
    family_type: 'Joint', family_values: 'Traditional', family_status: 'Affluent',
    about_family: 'Lucknow-based Rajput family with a long line of government service. Two elder brothers, both settled. Joint family property in Lucknow.',
    about: 'Delhi Police SP, IIT Delhi alum. Believe in shared values and small everyday rituals more than grand gestures. Looking for someone thoughtful and well-read.',
    time_of_birth: '04:10 AM', place_of_birth: 'Lucknow', rashi: 'Dhanu (Sagittarius)', nakshatra: 'Mula',
    kundli_matching: 'Yes',
    preferred_hubs: 'Delhi, Gurugram, Noida',
    pref_age: '27–35', pref_height: `5'5" – 5'10"`,
    pref_marital: ['Never married', 'Divorced'], pref_religion: 'Hindu',
    pref_education: ['Master’s degree', 'Doctorate / PhD', 'Medical (MBBS / MD)', 'Law (LLB / LLM)'],
    pref_diet: ['Vegetarian', 'Non-vegetarian'],
    pref_notes: 'Family values matter. Education and an independent career are essential. Open to a woman from any cadre posted in NCR.',
  },
  {
    n: 4, login: 'priya.s@ncr-tests.in', name: 'Priya Sharma', gender: 'female',
    cadre: 'CSSS', cadreCode: 'CSSS · Stenographer Grade B',
    ministry: 'Ministry of Finance', organisation: 'Department of Economic Affairs',
    city: 'Gurugram', hometown: 'Bhopal, Madhya Pradesh', posting_outlook: 'Stable NCR posting',
    dob: '1993-06-18', height: `5'5" (165 cm)`,
    mother_tongue: 'Hindi', religion: 'Hindu', caste: 'Brahmin',
    marital_status: 'Never married', diet: 'Vegetarian', drink: 'No', smoke: 'No',
    hobbies: ['Reading', 'Music', 'Yoga', 'Cooking', 'Travel'],
    body_type: 'Slim', complexion: 'Fair', physical_status: 'Normal', blood_group: 'A+',
    sub_caste: 'Saraswat', gothra: 'Bharadwaj', manglik: 'No',
    highest_education: 'Master’s degree', college: 'Lady Shri Ram College, Delhi', field_of_study: 'English Literature',
    designation: 'Stenographer Grade B', annual_income: '₹10–15 L',
    relocate: 'Prefer to stay in NCR',
    father_status: 'Retired', father_occupation: 'Retired Indian Railways Officer',
    mother_status: 'Homemaker', mother_occupation: '',
    brothers: '1', brothers_married: '0', sisters: '0', sisters_married: '0',
    family_type: 'Nuclear', family_values: 'Moderate', family_status: 'Upper middle class',
    about_family: 'Bhopal-based Saraswat Brahmin family. Father retired from Railways; one younger brother in IIT Bombay. Mother is a homemaker who runs a small kitchen garden.',
    about: 'Gurugram-based CSSS officer with the Ministry of Finance. I read, cook, and do yoga — not always in that order. Looking for someone who values quiet evenings as much as big plans.',
    time_of_birth: '07:50 AM', place_of_birth: 'Bhopal', rashi: 'Mithuna (Gemini)', nakshatra: 'Punarvasu',
    kundli_matching: 'Yes',
    preferred_hubs: 'Gurugram, Delhi, Noida',
    pref_age: '29–35', pref_height: `5'8" – 6'2"`,
    pref_marital: ['Never married'], pref_religion: 'Hindu',
    pref_education: ['Master’s degree', 'Doctorate / PhD', 'Professional (CA / CS / CMA)', 'Law (LLB / LLM)'],
    pref_diet: ['Vegetarian', 'Jain'],
    pref_notes: 'A fellow CSS / CSSS / DANICS / central services officer would be ideal. Open to other permanent Delhi postings.',
  },
  {
    n: 5, login: 'nisha.m@ncr-tests.in', name: 'Nisha Mehra', gender: 'female',
    cadre: 'DANICS', cadreCode: 'DANICS · Grade A',
    ministry: 'Ministry of Housing & Urban Affairs', organisation: 'DDA — Land Disposal Wing',
    city: 'Dwarka, New Delhi', hometown: 'Dehradun, Uttarakhand', posting_outlook: 'Long-term Delhi posting',
    dob: '1991-02-25', height: `5'4" (163 cm)`,
    mother_tongue: 'Hindi', religion: 'Hindu', caste: 'No bar / Caste no bar',
    marital_status: 'Never married', diet: 'Eggetarian', drink: 'No', smoke: 'No',
    hobbies: ['Yoga', 'Trekking', 'Photography', 'Gardening'],
    body_type: 'Average', complexion: 'Wheatish', physical_status: 'Normal', blood_group: 'B+',
    sub_caste: '', gothra: 'Kashyap', manglik: 'No',
    highest_education: 'Bachelor’s degree', college: 'Delhi University — SRCC', field_of_study: 'Commerce',
    designation: 'Assistant Director', annual_income: '₹10–15 L',
    relocate: 'Prefer to stay in NCR',
    father_status: 'Employed', father_occupation: 'Defence Accounts Officer (Retd., re-employed as consultant)',
    mother_status: 'Homemaker', mother_occupation: '',
    brothers: '0', brothers_married: '0', sisters: '1', sisters_married: '1',
    family_type: 'Nuclear', family_values: 'Liberal', family_status: 'Upper middle class',
    about_family: 'Dehradun-based defence family. Father is a retired defence accounts officer; mother is a homemaker; one elder sister, married and in Mumbai.',
    about: 'DDA officer living in Dwarka. I trek on long weekends and grow tulsi on my balcony. Looking for someone easygoing, well-read, with their own ambitions.',
    time_of_birth: '03:30 PM', place_of_birth: 'Dehradun', rashi: 'Meena (Pisces)', nakshatra: 'Revati',
    kundli_matching: 'Optional',
    preferred_hubs: 'Delhi, Gurugram, Noida',
    pref_age: '28–34', pref_height: `5'8" – 6'1"`,
    pref_marital: ['Never married'], pref_religion: 'Hindu, Sikh, or No bar',
    pref_education: ['Bachelor’s degree', 'Master’s degree', 'Professional (CA / CS / CMA)'],
    pref_diet: ['Vegetarian', 'Eggetarian', 'Non-vegetarian'],
    pref_notes: 'A man with a stable career and a kind family. Delhi NCR location is a must — long-distance is a deal-breaker.',
  },
  {
    n: 6, login: 'aisha.r@ncr-tests.in', name: 'Aisha Rao', gender: 'female',
    cadre: 'IFS', cadreCode: 'IFS · Under Secretary',
    ministry: 'Ministry of External Affairs', organisation: 'MEA Headquarters',
    city: 'Chanakyapuri, New Delhi', hometown: 'Hyderabad, Telangana', posting_outlook: 'Currently NCR, open to international postings later',
    dob: '1989-11-08', height: `5'6" (168 cm)`,
    mother_tongue: 'Telugu', religion: 'Hindu', caste: 'No bar / Caste no bar',
    marital_status: 'Never married', diet: 'Vegetarian', drink: 'No', smoke: 'No',
    hobbies: ['Reading', 'Travel', 'Writing', 'Films & OTT', 'Art & craft'],
    body_type: 'Slim', complexion: 'Wheatish', physical_status: 'Normal', blood_group: 'O+',
    sub_caste: '', gothra: 'Bharadwaj', manglik: 'No',
    highest_education: 'Master’s degree', college: 'JNU', field_of_study: 'International Relations',
    designation: 'Under Secretary (MEA)', annual_income: '₹15–25 L',
    relocate: 'Open to discussion',
    father_status: 'Retired', father_occupation: 'Retired IAS Officer (TS Cadre)',
    mother_status: 'Homemaker', mother_occupation: '',
    brothers: '1', brothers_married: '0', sisters: '0', sisters_married: '0',
    family_type: 'Nuclear', family_values: 'Liberal', family_status: 'Affluent',
    about_family: 'Hyderabad-based cosmopolitan family. Father is a retired IAS officer; mother is a homemaker with a deep interest in classical music; one younger brother at IIM Ahmedabad.',
    about: 'IFS officer at MEA HQ, JNU alum. Languages, books, and slow Sunday breakfasts. Looking for someone who would be a partner in the truest sense — at home and abroad.',
    time_of_birth: '09:15 AM', place_of_birth: 'Hyderabad', rashi: 'Vrishchika (Scorpio)', nakshatra: 'Anuradha',
    kundli_matching: 'No',
    preferred_hubs: 'Delhi, Chanakyapuri, Greater Kailash',
    pref_age: '30–38', pref_height: `5'9" – 6'2"`,
    pref_marital: ['Never married', 'Divorced'], pref_religion: 'Hindu, Christian, or No bar',
    pref_education: ['Master’s degree', 'Doctorate / PhD', 'Medical (MBBS / MD)', 'Law (LLB / LLM)'],
    pref_diet: ['Vegetarian', 'Non-vegetarian', 'Eggetarian'],
    pref_notes: 'Should be comfortable with an IFS lifestyle — postings, languages, and occasional international travel. Educated and self-driven.',
  },
];

// ---- HTTP helpers ----

function jar() {
  const state = { cookie: '' };
  async function req(path, init = {}) {
    // Default to JSON, but let FormData requests override by passing
    // `formData: true` so we don't force a content-type.
    const isJson = init.body !== undefined && !(init.body instanceof FormData);
    const baseHeaders = isJson ? { 'content-type': 'application/json' } : {};
    const r = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { ...baseHeaders, ...(init.headers ?? {}), ...(state.cookie ? { cookie: state.cookie } : {}) },
    });
    const set = r.headers.get('set-cookie');
    if (set) state.cookie = set.split(';')[0];
    return r;
  }
  return { req, state };
}

async function login(jar, identifier, password) {
  const r = await jar.req('/api/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`login ${identifier} → ${r.status} ${body}`);
  }
}

async function register(jar, identifier, fullName, email, password) {
  const r = await jar.req('/api/auth/register', { method: 'POST', body: JSON.stringify({ identifier, fullName, email, password }) });
  return r;
}

async function putProfile(jar, body) {
  const r = await jar.req('/api/profile', { method: 'PUT', body: JSON.stringify(body) });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`PUT /api/profile → ${r.status} ${t}`);
  }
}

async function putPreferences(jar, body) {
  const r = await jar.req('/api/preferences', { method: 'PUT', body: JSON.stringify(body) });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`PUT /api/preferences → ${r.status} ${t}`);
  }
}

function mimeOf(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
}

// Cloudflare Workers reject bodies over ~1MB; downscale and re-encode source
// PNGs as JPEGs before uploading. Keeps the user-supplied source intact.
async function shrinkForUpload(filePath) {
  const out = await sharp(readFileSync(filePath))
    .resize({ width: 720, withoutEnlargement: true })
    .jpeg({ quality: 78 })
    .toBuffer();
  return { bytes: out, mime: 'image/jpeg', ext: 'jpg' };
}

async function uploadPhoto(jar, filePath, endpoint = '/api/photo') {
  const shrunk = await shrinkForUpload(filePath);
  const blob = new Blob([shrunk.bytes], { type: shrunk.mime });
  const form = new FormData();
  form.append('file', blob, `${filePath.split(/[\\/]/).pop().replace(/\.[^.]+$/, '')}.${shrunk.ext}`);
  const r = await jar.req(endpoint, { method: 'POST', body: form });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`POST ${endpoint} → ${r.status} ${t}`);
  }
}

async function submitVerification(jar, photoPath) {
  const bytes = photoPath === '__inline_tiny_png__'
    ? Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    : readFileSync(photoPath);
  const mime = photoPath === '__inline_tiny_png__' ? 'image/png' : mimeOf(photoPath);
  const blob = new Blob([bytes], { type: mime });
  const form = new FormData();
  form.append('govt_id', blob, 'govt-id.png');
  form.append('photo_id', blob, 'photo-id.png');
  const r = await jar.req('/api/verify', { method: 'POST', body: form });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`POST /api/verify → ${r.status} ${t}`);
  }
}

async function adminApprove(adminJar, userId) {
  const r = await adminJar.req('/api/verify', { method: 'PATCH', body: JSON.stringify({ userId, action: 'approve' }) });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`PATCH /api/verify approve → ${r.status} ${t}`);
  }
}

// ---- Seed driver ----

async function seedUser(user, photoPath, placeholderPath, adminJar, opts = {}) {
  const j = jar();
  const tag = `${user.login} (${user.name})`;
  process.stdout.write(`\n• ${tag}\n`);

  const reg = await register(j, user.login, user.name, user.login, PASSWORD);
  if (reg.status === 409) {
    console.log(`   ↳ already exists — re-login + patch`);
    await login(j, user.login, PASSWORD);
  } else if (!reg.ok) {
    const t = await reg.text();
    throw new Error(`register → ${reg.status} ${t}`);
  } else {
    console.log(`   ↳ registered`);
  }

  await putProfile(j, {
    gender: user.gender, dob: user.dob, height: user.height,
    mother_tongue: user.mother_tongue, religion: user.religion, caste: user.caste,
    created_for: 'Myself',
    marital_status: user.marital_status,
    diet: user.diet, drink: user.drink, smoke: user.smoke,
    hobbies: user.hobbies,
    body_type: user.body_type, complexion: user.complexion, physical_status: user.physical_status,
    blood_group: user.blood_group,
    sub_caste: user.sub_caste, gothra: user.gothra, manglik: user.manglik,
    service: user.cadre, ministry: user.ministry, organisation: user.organisation,
    highest_education: user.highest_education, college: user.college,
    field_of_study: user.field_of_study, designation: user.designation,
    annual_income: user.annual_income,
    residence_city: user.city, hometown: user.hometown, posting_outlook: user.posting_outlook,
    relocate: user.relocate, preferred_hubs: user.preferred_hubs,
    father_status: user.father_status, father_occupation: user.father_occupation,
    mother_status: user.mother_status, mother_occupation: user.mother_occupation,
    brothers: user.brothers, brothers_married: user.brothers_married,
    sisters: user.sisters, sisters_married: user.sisters_married,
    family_type: user.family_type, family_values: user.family_values,
    family_status: user.family_status, about_family: user.about_family,
    about: user.about, family_notes: '',
    time_of_birth: user.time_of_birth, place_of_birth: user.place_of_birth,
    rashi: user.rashi, nakshatra: user.nakshatra, kundli_matching: user.kundli_matching,
    photo_mode: 'verified', profile_visible: 1,
  });
  console.log(`   ↳ profile filled (38 fields)`);

  // LGB-mix scenario: Aarav (male) → looks for Male, Priya (female) →
  // looks for Female. The rest stick to the conventional default. This
  // gives the orientation-aware discovery all four paths to test.
  const lgbOverride = {
    'aarav.m@ncr-tests.in': 'Male',
    'priya.s@ncr-tests.in': 'Female',
  };
  const prefLookingFor = lgbOverride[user.login] ?? (user.gender === 'male' ? 'Female' : user.gender === 'female' ? 'Male' : 'Any / All Genders');
  const forcePrefLine = opts.forcePrefs && lgbOverride[user.login] ? ' (forced)' : '';

  // Always PUT preferences (the route is idempotent — it overwrites).
  // The forcePrefs flag guarantees this runs even if anything in the
  // earlier profile PUT short-circuited.
  if (opts.forcePrefs) {
    await putPreferences(j, {
      pref_age: user.pref_age, pref_height: user.pref_height,
      pref_marital: user.pref_marital, pref_religion: user.pref_religion,
      pref_education: user.pref_education, pref_diet: user.pref_diet, pref_notes: user.pref_notes,
      pref_looking_for: prefLookingFor,
    });
    console.log(`   ↳ preferences saved (force — pref_looking_for=${prefLookingFor}${forcePrefLine})`);
  } else {
    await putPreferences(j, {
      pref_age: user.pref_age, pref_height: user.pref_height,
      pref_marital: user.pref_marital, pref_religion: user.pref_religion,
      pref_education: user.pref_education, pref_diet: user.pref_diet, pref_notes: user.pref_notes,
      pref_looking_for: prefLookingFor,
    });
    console.log(`   ↳ preferences saved`);
  }

  if (existsSync(photoPath)) {
    await uploadPhoto(j, photoPath, '/api/photo');
    console.log(`   ↳ primary photo uploaded`);
  } else {
    console.log(`   ↳ no photo at ${photoPath} — skipping`);
  }

  if (placeholderPath !== '__inline_tiny_png__' && existsSync(placeholderPath) && user.n % 2 === 0) {
    await uploadPhoto(j, placeholderPath, '/api/horoscope-image');
    console.log(`   ↳ horoscope image uploaded`);
  }

  // submitVerification accepts the inline sentinel; always run.
  await submitVerification(j, placeholderPath);
  console.log(`   ↳ verification submitted`);
  if (adminJar) {
    const me = await j.req('/api/auth/me');
    if (me.ok) {
      const meBody = await me.json();
      await adminApprove(adminJar, meBody.user.id);
      console.log(`   ↳ admin-approved → verified badge`);
    }
  }
}

async function main() {
  // Sanity: do we have what we need?
  let placeholder = null;
  for (const candidate of ['placeholder.png', 'placeholder.pdf', 'placeholder.jpg']) {
    const p = join(PHOTOS_DIR, candidate);
    if (existsSync(p)) { placeholder = p; break; }
  }
  if (!placeholder) {
    // fall back to a tiny in-memory 1x1 PNG (68 bytes) so we stay well below
    // the worker's multipart body-size limit. The admin approves anyway so
    // pixel content doesn't matter for these ID docs.
    placeholder = '__inline_tiny_png__';
  }
  for (const u of USERS) {
    const p = join(PHOTOS_DIR, `${u.n}.png`);
    if (!existsSync(p)) {
      console.error(`Missing photo: public/test-photos/${u.n}.png`);
      process.exit(1);
    }
  }

  // Optional admin login for auto-approve
  let adminJar = null;
  if (ADMIN_PASSWORD) {
    adminJar = jar();
    await login(adminJar, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log(`admin login OK → will auto-approve verifications`);
  } else {
    console.log(`SEED_ADMIN_PASSWORD not set → verifications will be left 'pending' (admin must approve manually)`);
  }

  // CLI flags
  //   --force-prefs   always PUT partner_preferences (incl. pref_looking_for)
  //                   using the LGB-mix scenario, even for existing users.
  //                   Useful when you edit pref_looking_for in the editor
  //                   and want to reset all 6 accounts to a chosen scheme
  //                   for testing.
  const args = new Set(process.argv.slice(2));
  const FORCE_PREFS = args.has('--force-prefs');
  if (FORCE_PREFS) {
    console.log(`--force-prefs: LGB mix — Aarav/Male, Priya/Female, others conventional`);
  }

  for (const u of USERS) {
    await seedUser(u, join(PHOTOS_DIR, `${u.n}.png`), placeholder, adminJar, { forcePrefs: FORCE_PREFS });
  }

  console.log(`\n✓ seeded ${USERS.length} profiles\n`);
}

main().catch((e) => {
  console.error('\n✗ seed failed:', e.message);
  process.exit(1);
});