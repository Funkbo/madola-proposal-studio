"use server";

import { createCustomer } from "@/lib/services/customers";
import { redirect } from "next/navigation";

export async function createCustomerAction(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const addressLine1 = formData.get("addressLine1") as string;
  const addressLine2 = (formData.get("addressLine2") as string) || undefined;
  const city = formData.get("city") as string;
  const postcode = formData.get("postcode") as string;

  if (!firstName || !lastName || !email || !phone || !addressLine1 || !city || !postcode) {
    return { error: "Please fill in all required customer fields." };
  }

  const { customer, error } = await createCustomer({
    firstName,
    lastName,
    email,
    phone,
    addressLine1,
    addressLine2,
    city,
    postcode,
  });

  if (error || !customer) {
    return { error: error || "Failed to create customer record." };
  }

  console.log("[CUSTOMER_CREATE_REDIRECT]", customer.id);
  redirect("/customers");
}
