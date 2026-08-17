import { getCustomers as repoGetCustomers, getCustomerById as repoGetCustomerById, createCustomer as repoCreateCustomer } from "@/lib/repositories/customerRepository";
import { Customer } from "@/types/customer";

export async function getCustomers(searchQuery?: string): Promise<Customer[]> {
  return repoGetCustomers(searchQuery);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  return repoGetCustomerById(id);
}

export async function createCustomer(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  country?: string;
}): Promise<{ customer: Customer | null; error: string | null }> {
  return repoCreateCustomer(payload);
}
