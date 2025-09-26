// Populating the constants.ts file with initial mock data.
import { User, Document, DocumentStatus, UserRole } from './types';

export const ADMIN_OFFICE_NAME = 'Records Section';

export const USERS: User[] = [
  { id: 'user-richard', name: 'Richard', office: 'Cashier Section', role: UserRole.STAFF },
  { id: 'user-josh', name: 'Josh', office: ADMIN_OFFICE_NAME, role: UserRole.ADMIN },
  { id: 'user-daisy', name: 'Daisy', office: 'SGOD Section', role: UserRole.APPROVER },
];


export const OFFICES: string[] = [
  'Cashier Section',
  'Records Section',
  'SGOD Section',
  'HR Section',
  'Accounting Section',
];

export const INITIAL_DOCUMENTS: Document[] = [];