export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postcode: string;
  country: string;
  companyId?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  proposalsCount?: number;
}
