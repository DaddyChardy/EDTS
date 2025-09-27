// Populating the types.ts file with required type definitions for the application.
export enum DocumentStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  RECEIVED = 'Received',
  FORWARDED = 'Forwarded',
  FOR_APPROVAL = 'For Approval',
  APPROVED = 'Approved',
  RELEASED = 'Released',
  COMPLETED = 'Completed',
  DISAPPROVED = 'Disapproved',
}

export enum UserRole {
  STAFF = 'Staff',
  APPROVER = 'Approver',
  ADMIN = 'Admin',
  SUPER_ADMIN = 'Super Admin',
}

export interface User {
  id: string;
  name: string;
  office: string;
  role: UserRole;
}

export interface DocumentHistory {
  id: string;
  timestamp: string;
  action: string;
  user: User;
  office: string;
  remarks?: string;
}

export interface Document {
  id: string;
  trackingNumber: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  deliveryType: 'Internal' | 'External';
  status: DocumentStatus;
  sender: User | null;
  recipientOffice: string;
  createdAt: string;
  updatedAt: string;
  history: DocumentHistory[];
}

export type Page = 'dashboard' | 'documents' | 'create' | 'detail' | 'superadmin' | 'edit';