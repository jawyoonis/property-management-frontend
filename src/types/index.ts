// ─── Enums ───────────────────────────────────────────────────────────────────

export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export type PaymentType = 'VISA' | 'MASTERCARD' | 'ZAAD' | 'E_CHECK' | 'CREDIT_CARD' | 'PAYPAL' | 'DEBIT_CARD';

export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type PropertyStatus = 'AVAILABLE' | 'OCCUPIED' | 'UNDER_MAINTENANCE';

export type PropertyType = 'APARTMENT' | 'HOUSE' | 'OFFICE' | 'SHOP' | 'WAREHOUSE';

// ─── Core DTOs ────────────────────────────────────────────────────────────────

export interface OwnerDto {
  ownerId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PropertyDto {
  propertyId?: number;
  name: string;
  address: string;
  type: PropertyType;
  status: PropertyStatus;
  ownerDto?: OwnerDto;
}

export interface TenantDto {
  tenantId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface LeaseDto {
  leaseId?: number;
  propertyDto?: PropertyDto;
  tenantDto?: TenantDto;
  startDate: string;
  endDate: string;
  rent: number;
  securityDeposit: number;
}

export interface PaymentDto {
  paymentId?: number;
  leaseDto?: LeaseDto;
  datePaid: string;
  amount: number;
  paymentType: PaymentType;
  status: PaymentStatus;
  // Zaad-specific fields (handled client-side before submission)
  zaadPhoneNumber?: string;
  zaadTransactionRef?: string;
}

export interface MaintenanceRequestDto {
  requestId?: number;
  tenantDto?: TenantDto;
  propertyDto?: PropertyDto;
  description: string;
  requestedDate?: string;
  status: MaintenanceStatus;
}

export interface FinancialSummaryDto {
  summaryId?: number;
  propertyDto?: PropertyDto;
  totalRentCollected: number;
  totalExpenses: number;
  netProfit: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
