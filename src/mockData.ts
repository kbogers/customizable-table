import { faker } from '@faker-js/faker';

export interface Request {
  requestId: string;
  physician: string;
  institution: string;
  country: string;
  owner: string;
  phase: 'New request' | 'Enrollment' | 'Consultation' | 'Follow-up' | 'Diagnosis' | 'Treatment' | 'Surgery' | 'Rehabilitation' | 'Assessment';
  comments: string;
}

export const generateData = (count: number): Request[] => {
  const data: Request[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      requestId: `REQ${faker.string.numeric(8)}`,
      physician: faker.person.fullName(),
      institution: faker.company.name() + (Math.random() > 0.5 ? ' Hospital' : ' Medical Center'),
      country: faker.location.countryCode('alpha-2'),
      owner: faker.person.fullName(),
      phase: faker.helpers.arrayElement([
        'New request',
        'Enrollment',
        'Consultation',
        'Follow-up',
        'Diagnosis',
        'Treatment',
        'Surgery',
        'Rehabilitation',
        'Assessment',
      ]),
      comments: Math.random() > 0.3 ? faker.lorem.sentence() : '',
    });
  }
  return data;
};
