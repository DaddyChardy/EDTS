// Populating the constants.ts file with initial mock data.
import { User, Document, DocumentStatus, UserRole } from './types';

export const ADMIN_OFFICE_NAME = 'Records Section';

export const USERS: User[] = [
  { id: 'user-richard', name: 'Richard', office: 'Cashier Section', role: UserRole.STAFF, position: 'Cashier I' },
  { id: 'user-josh', name: 'Josh', office: ADMIN_OFFICE_NAME, role: UserRole.ADMIN, position: 'Records Officer' },
  { id: 'user-daisy', name: 'Daisy', office: 'SGOD Section', role: UserRole.APPROVER, position: 'Chief' },
  { id: 'user-sam', name: 'Sam', office: 'IT Department', role: UserRole.SUPER_ADMIN, position: 'IT Administrator' },
];


export const INITIAL_DOCUMENTS: Document[] = [];