export type Role = 'USER' | 'ADMIN';
export type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataEntry {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: Status;
  value: number;
  metadata?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DistributionEntry {
  id: string;
  serialNumber: number;
  subCity: string;
  woreda: string;
  numberOfCustomers: number;
  communitiesReceived: number;
  institutionCustomers: number;
  nursingMothersQuintals: number;
  communityQuintals: number;
  institutionQuintals: number;
  totalQuintals: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataEntryFormData {
  title: string;
  description: string;
  category: string;
  status: Status;
  value: number;
}

export interface KPIData {
  totalEntries: number;
  growthRate: number;
  processingSpeed: number;
  activeSessions: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number;
  value3?: number;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface FilterState {
  search: string;
  category: string;
  status: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface DatabaseStatus {
  status: 'connected' | 'syncing' | 'offline';
  lastSync: Date | null;
}