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

export const specialties = [
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

export const requestTypes = [
  'Expanded access',
  'Compassionate use',
  'Named patient',
  'Pre-approval access',
] as const;

export const fundingModels = [
  'Free of charge',
  'Cost recovery',
  'Full price',
  'Insurance',
] as const;

export const phases = [
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
      physicianPhone: `+${faker.string.numeric(11)}`,
      physicianSpecialty: faker.helpers.arrayElement(specialties),
    });
  }
  return data;
};

// Order interface
export interface Order {
  // Link to request
  requestId: string;

  // CUSTOMER data
  customer_order_number: string;
  customer_party_id: string;
  customer_party_name: string;
  customer_party_address: string;

  // PATIENT data
  eap_dossier_number: string;
  eap_dossier_approval_status: 'Approved' | 'Pending' | 'Rejected' | 'Under Review';
  eap_dossier_date_of_approval: string;

  // Order planning data (calculated by system)
  order_reminder_date: string;
  next_order_expected_date: string;

  // ORDER DATA - Identifiers
  order_number: string;
  order_status: 'Pending' | 'Approved' | 'Shipped' | 'Delivered' | 'Cancelled' | 'On Hold';
  status_updated_at: string;
  order_tracking_number: string;
  quantity: number;
  weeks_ordered: number;
  shipment_order_number: string;

  // ORDER DATA - Dates
  order_received_on: string;
  order_created_on: string;
  order_approved_on: string;
  order_shipped_on: string;
  order_delivered_on: string;

  // Notes
  notes: string;

  // Source
  source: 'kinaxis' | 'manual';
}

export const orderStatuses: Order['order_status'][] = [
  'Pending',
  'Approved',
  'Shipped',
  'Delivered',
  'Cancelled',
  'On Hold',
];

export const eapApprovalStatuses: Order['eap_dossier_approval_status'][] = [
  'Approved',
  'Pending',
  'Rejected',
  'Under Review',
];

// Helper function to calculate dates
const calculateReminderDate = (lastOrderDate: Date | null, weeksOrdered: number): Date => {
  if (!lastOrderDate) {
    return faker.date.future({ years: 1 });
  }
  const reminderDate = new Date(lastOrderDate);
  reminderDate.setDate(reminderDate.getDate() + (weeksOrdered * 7) - 7); // 1 week before next order
  return reminderDate;
};

const calculateNextOrderDate = (lastOrderDate: Date | null, weeksOrdered: number): Date => {
  if (!lastOrderDate) {
    return faker.date.future({ years: 1 });
  }
  const nextDate = new Date(lastOrderDate);
  nextDate.setDate(nextDate.getDate() + (weeksOrdered * 7));
  return nextDate;
};

export const generateOrders = (requests: Request[], ordersPerRequest: number = 3): Order[] => {
  const orders: Order[] = [];
  
  requests.forEach((request) => {
    // Each request can have 0 to several orders
    const orderCount = Math.floor(Math.random() * (ordersPerRequest + 1));
    
    let lastOrderDate: Date | null = null;
    
    for (let i = 0; i < orderCount; i++) {
      const orderCreatedOn: Date = lastOrderDate 
        ? faker.date.between({ from: lastOrderDate, to: new Date() })
        : faker.date.recent({ days: 180 });
      
      const weeksOrdered = faker.number.int({ min: 2, max: 12 });
      const orderReminderDate = calculateReminderDate(lastOrderDate, weeksOrdered);
      const nextOrderExpectedDate = calculateNextOrderDate(orderCreatedOn, weeksOrdered);
      
      const orderStatus = faker.helpers.arrayElement(orderStatuses);
      const orderApprovedOn = orderStatus !== 'Pending' 
        ? faker.date.between({ from: orderCreatedOn, to: new Date() })
        : '';
      const orderShippedOn = ['Shipped', 'Delivered'].includes(orderStatus)
        ? faker.date.between({ from: orderApprovedOn || orderCreatedOn, to: new Date() })
        : '';
      const orderDeliveredOn = orderStatus === 'Delivered'
        ? faker.date.between({ from: orderShippedOn || orderCreatedOn, to: new Date() })
        : '';
      
      const eapApprovalDate = faker.helpers.arrayElement(eapApprovalStatuses) === 'Approved'
        ? faker.date.past({ years: 1 }).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '';

      orders.push({
        requestId: request.requestId,
        
        // CUSTOMER data
        customer_order_number: `CUST-${faker.string.alphanumeric(8).toUpperCase()}`,
        customer_party_id: `PARTY-${faker.string.numeric(6)}`,
        customer_party_name: faker.company.name(),
        customer_party_address: faker.location.streetAddress({ useFullAddress: true }),
        
        // PATIENT data
        eap_dossier_number: request.eapDossierNumber || `EAP-${faker.string.numeric(6)}`,
        eap_dossier_approval_status: faker.helpers.arrayElement(eapApprovalStatuses),
        eap_dossier_date_of_approval: eapApprovalDate,
        
        // Order planning data
        order_reminder_date: orderReminderDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        next_order_expected_date: nextOrderExpectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        
        // ORDER DATA - Identifiers
        order_number: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
        order_status: orderStatus,
        status_updated_at: faker.date.recent({ days: 30 }).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        order_tracking_number: Math.random() > 0.3 ? faker.string.alphanumeric(12).toUpperCase() : '',
        quantity: faker.number.int({ min: 1, max: 50 }),
        weeks_ordered: weeksOrdered,
        shipment_order_number: ['Shipped', 'Delivered'].includes(orderStatus)
          ? `SHIP-${faker.string.alphanumeric(8).toUpperCase()}`
          : '',
        
        // ORDER DATA - Dates
        order_received_on: orderCreatedOn.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        order_created_on: orderCreatedOn.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        order_approved_on: orderApprovedOn ? orderApprovedOn.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        order_shipped_on: orderShippedOn ? orderShippedOn.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        order_delivered_on: orderDeliveredOn ? orderDeliveredOn.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',

        // Notes
        notes: '',

        // All generated orders come from Kinaxis OMS integration
        source: 'kinaxis',
      });
      
      lastOrderDate = orderCreatedOn;
    }
  });
  
  return orders;
};
