import { faker } from '@faker-js/faker';

export interface Request {
  // Core fields (visible by default)
  requestId: string;
  physician: string;
  institution: string;
  country: string;
  owner: string;
  phase: 'New request' | 'Enrollment' | 'Consultation' | 'Follow-up' | 'Diagnosis' | 'Treatment' | 'Surgery' | 'Rehabilitation' | 'Assessment';
  comments: string;

  // Additional fields (hidden by default)
  product: string;
  requestType: 'Expanded access' | 'Compassionate use' | 'Named patient' | 'Pre-approval access';
  fundingModel: 'Free of charge' | 'Cost recovery' | 'Full price' | 'Insurance';
  receivedOn: string;
  rationale: string;

  // Identifiers
  patientInitials: string;
  patientNumber: string;
  castorId: string;
  eapDossierNumber: string;

  // Physician details
  physicianEmail: string;
  physicianFirstName: string;
  physicianLastName: string;
  physicianPhone: string;
  physicianSpecialty: 'Cardiology' | 'Oncology' | 'Neurology' | 'Pediatrics' | 'Internal Medicine' | 'Surgery' | 'Psychiatry' | 'Dermatology' | 'Endocrinology' | 'Gastroenterology';
}

const specialties = [
  'Cardiology',
  'Oncology',
  'Neurology',
  'Pediatrics',
  'Internal Medicine',
  'Surgery',
  'Psychiatry',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
] as const;

const requestTypes = [
  'Expanded access',
  'Compassionate use',
  'Named patient',
  'Pre-approval access',
] as const;

const fundingModels = [
  'Free of charge',
  'Cost recovery',
  'Full price',
  'Insurance',
] as const;

const phases = [
  'New request',
  'Enrollment',
  'Consultation',
  'Follow-up',
  'Diagnosis',
  'Treatment',
  'Surgery',
  'Rehabilitation',
  'Assessment',
] as const;

const products = [
  'Pembrolizumab',
  'Trastuzumab',
  'Rituximab',
  'Bevacizumab',
  'Nivolumab',
  'Adalimumab',
  'Infliximab',
  'Tocilizumab',
  'Durvalumab',
  'Atezolizumab',
];

const rationales = [
  'The patient, a 48-year-old female with SOT (lung) EBV+ PTLD, relapsed and refractory to 4 cycles Rituximab, now showing significant progressive disease. Patient does not qualify for the clinical trial but Product B shows promise in similar cases.',
  'Patient has exhausted all standard treatment options and shows progressive disease. Expanded access is the only remaining option for this critical condition.',
  'Clinical trial exclusion criteria prevent enrollment. Patient meets all other requirements and would benefit significantly from treatment.',
  'Rare genetic condition with no approved therapies. Compassionate use requested based on promising preclinical data.',
  'Terminal patient with rapid disease progression. Immediate access needed as clinical trial enrollment would take too long.',
];

export const generateData = (count: number): Request[] => {
  const data: Request[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const patientFirstInitial = faker.string.alpha({ length: 1, casing: 'upper' });
    const patientLastInitial = faker.string.alpha({ length: 1, casing: 'upper' });

    data.push({
      // Core fields
      requestId: `REQ${faker.string.numeric(9)}`,
      physician: `${firstName} ${lastName}`,
      institution: faker.company.name() + (Math.random() > 0.5 ? ' Hospital' : ' Medical Center'),
      country: faker.location.country(),
      owner: faker.person.fullName(),
      phase: faker.helpers.arrayElement(phases),
      comments: Math.random() > 0.3 ? faker.lorem.sentence() : '',

      // Additional fields
      product: Math.random() > 0.2 ? faker.helpers.arrayElement(products) : '',
      requestType: faker.helpers.arrayElement(requestTypes),
      fundingModel: faker.helpers.arrayElement(fundingModels),
      receivedOn: faker.date.recent({ days: 90 }).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      rationale: Math.random() > 0.3 ? faker.helpers.arrayElement(rationales) : '',

      // Identifiers
      patientInitials: Math.random() > 0.4 ? `${patientFirstInitial}${patientLastInitial}` : '',
      patientNumber: `REQ${faker.string.numeric({ length: 9, allowLeadingZeros: true })}`,
      castorId: Math.random() > 0.5 ? faker.string.alphanumeric(8).toUpperCase() : '',
      eapDossierNumber: Math.random() > 0.6 ? `EAP-${faker.string.numeric(6)}` : '',

      // Physician details
      physicianEmail: faker.internet.email({ firstName: firstName.toLowerCase(), lastName: lastName.toLowerCase() }),
      physicianFirstName: firstName,
      physicianLastName: lastName,
      physicianPhone: faker.phone.number('+##########'),
      physicianSpecialty: faker.helpers.arrayElement(specialties),
    });
  }
  return data;
};
