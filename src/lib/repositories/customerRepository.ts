import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { Customer } from "@/types/customer";
import { getSupabaseEnv } from "@/lib/supabase/config";

const LOCAL_STORAGE_CUSTOMERS_KEY = "madola_saved_customers_list";

function getLocalCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOMERS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading local customers fallback", e);
  }
  return [
    {
      id: "cust-default-1",
      firstName: "Amanda",
      lastName: "Ratucoko",
      email: "amanda@example.co.uk",
      phone: "+44 7700 900077",
      addressLine1: "42 Richmond Hill",
      addressLine2: "Flat 2B",
      city: "Richmond",
      postcode: "TW10 6QX",
      country: "United Kingdom",
      createdBy: "usr-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function saveLocalCustomer(customer: Customer) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalCustomers();
    const updated = [customer, ...current.filter((c) => c.id !== customer.id)];
    localStorage.setItem(LOCAL_STORAGE_CUSTOMERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving local customer fallback", e);
  }
}

export async function getCustomers(searchQuery?: string): Promise<Customer[]> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      let query = supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery && searchQuery.trim().length > 0) {
        const term = `%${searchQuery.trim()}%`;
        query = query.or(
          `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},postcode.ilike.${term}`
        );
      }

      const { data, error } = await query;

      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phone: row.phone,
          addressLine1: row.address_line_1,
          addressLine2: row.address_line_2,
          city: row.city,
          postcode: row.postcode,
          country: "United Kingdom",
          companyId: row.company_id || null,
          createdBy: row.created_by || "usr-1",
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
      }
      if (error) {
        console.error("[SUPABASE_GET_CUSTOMERS_ERROR]", error.message, error.details);
      }
    } catch (e: any) {
      console.error("Supabase getCustomers fetch failed", e);
    }
  }

  const local = getLocalCustomers();
  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase();
    return local.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.postcode.toLowerCase().includes(q)
    );
  }
  return local;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          addressLine1: data.address_line_1,
          addressLine2: data.address_line_2,
          city: data.city,
          postcode: data.postcode,
          country: "United Kingdom",
          companyId: data.company_id || null,
          createdBy: data.created_by || "usr-1",
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (e) {
      console.error("Supabase getCustomerById failed", e);
    }
  }

  const local = getLocalCustomers();
  return local.find((c) => c.id === id) || null;
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
  console.log("[CUSTOMER_CREATE_START]");
  console.log("[CUSTOMER_CREATE_INPUT]", { email: payload.email, city: payload.city });

  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        console.error("[CUSTOMER_CREATE_AUTH_ERROR] User must be signed in to create customers.", authError?.message);
        return { customer: null, error: "Authentication required. Please sign in to create customers." };
      }

      const user = authData.user;
      console.log("[CUSTOMER_CREATE_AUTH_USER]", user.id, user.email);

      // Query active user's company_id via RPC get_auth_company_id() or profiles table
      let companyId: string | null = null;
      const { data: rpcCompanyId, error: rpcError } = await supabase.rpc("get_auth_company_id");
      
      if (!rpcError && rpcCompanyId) {
        companyId = rpcCompanyId;
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user.id)
          .maybeSingle();
        companyId = profile?.company_id || null;
      }

      if (!companyId) {
        console.error("[CUSTOMER_CREATE_PROFILE_ERROR] Company ID not assigned to user profile", { userId: user.id });
        return { customer: null, error: "User profile company assignment not found." };
      }

      const insertData = {
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        address_line_1: payload.addressLine1,
        address_line_2: payload.addressLine2 || null,
        city: payload.city,
        postcode: payload.postcode,
        company_id: companyId,
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from("customers")
        .insert(insertData)
        .select("*")
        .single();

      if (!error && data) {
        const created: Customer = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          addressLine1: data.address_line_1,
          addressLine2: data.address_line_2,
          city: data.city,
          postcode: data.postcode,
          country: "United Kingdom",
          companyId: data.company_id,
          createdBy: data.created_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        saveLocalCustomer(created);
        console.log("[CUSTOMER_CREATE_RESULT]", "INSERT SUCCESS", created.id, "created_by:", created.createdBy, "company_id:", created.companyId);
        return { customer: created, error: null };
      }

      if (error) {
        console.error("[CUSTOMER_CREATE_ERROR]", error.message, error.details);
        return { customer: null, error: error.message };
      }
    } catch (e: any) {
      console.error("[CUSTOMER_CREATE_EXCEPTION]", e);
      return { customer: null, error: e.message || "Failed to create customer record in database." };
    }
  }

  const fallback: Customer = {
    id: `cust-local-${Date.now()}`,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    addressLine1: payload.addressLine1,
    addressLine2: payload.addressLine2 || null,
    city: payload.city,
    postcode: payload.postcode,
    country: payload.country || "United Kingdom",
    createdBy: "usr-local",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveLocalCustomer(fallback);
  return { customer: fallback, error: null };
}

export async function autoCreateCustomerFromExtraction(extraction: any): Promise<Customer | null> {
  try {
    const rawName = String(extraction?.customerName?.value || extraction?.normalised?.customer?.customerName || "").trim();
    const rawEmail = String(extraction?.salespersonEmail?.value || extraction?.normalised?.customer?.preparedByEmail || "").trim();
    const rawAddress = String(extraction?.address?.value || extraction?.normalised?.customer?.address || "Primary Property Address").trim();
    const rawPostcode = String(extraction?.postcode?.value || extraction?.normalised?.customer?.postcode || "UK-POSTCODE").trim();

    if (!rawName && !rawEmail) {
      return null;
    }

    const nameParts = rawName.split(" ");
    const firstName = nameParts[0] || "OpenSolar";
    const lastName = nameParts.slice(1).join(" ") || "Customer";
    const email = rawEmail.includes("@") ? rawEmail : `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z0-9]/gi, "")}@customer.co.uk`;

    // 1. Check existing local customers
    const localCusts = getLocalCustomers();
    const matchLocal = localCusts.find(
      (c) =>
        (c.email && c.email.toLowerCase() === email.toLowerCase()) ||
        `${c.firstName} ${c.lastName}`.toLowerCase() === rawName.toLowerCase()
    );
    if (matchLocal) {
      console.log("[AUTO_MATCH_LOCAL_CUSTOMER_SUCCESS]", matchLocal.id, matchLocal.firstName, matchLocal.lastName);
      return matchLocal;
    }

    // 2. Check Supabase DB if configured
    const { isConfigured } = getSupabaseEnv();
    if (isConfigured) {
      const supabase = await getSupabaseClient();
      const { data: dbMatches } = await supabase
        .from("customers")
        .select("*")
        .or(`email.eq.${email},first_name.ilike.${firstName}`);

      if (dbMatches && dbMatches.length > 0) {
        const match = dbMatches[0];
        const found: Customer = {
          id: match.id,
          firstName: match.first_name || firstName,
          lastName: match.last_name || lastName,
          email: match.email || email,
          phone: match.phone || "+44 7700 900077",
          addressLine1: match.address || rawAddress,
          city: match.city || "UK Location",
          postcode: match.postcode || rawPostcode,
          country: match.country || "United Kingdom",
          createdBy: match.created_by || "usr-1",
          createdAt: match.created_at || new Date().toISOString(),
          updatedAt: match.updated_at || new Date().toISOString(),
        };
        console.log("[AUTO_MATCH_DB_CUSTOMER_SUCCESS]", found.id, found.firstName, found.lastName);
        return found;
      }
    }

    // 3. Create new Customer record if no match found
    const { customer } = await createCustomer({
      firstName,
      lastName,
      email,
      phone: "+44 7700 900077",
      addressLine1: rawAddress,
      city: "UK Location",
      postcode: rawPostcode,
    });

    console.log("[AUTO_CREATE_CUSTOMER_SUCCESS]", customer?.id, customer?.firstName, customer?.lastName);
    return customer;
  } catch (e) {
    console.error("autoCreateCustomerFromExtraction error", e);
    return null;
  }
}

export async function updateCustomer(
  id: string,
  payload: Partial<Customer>
): Promise<{ customer: Customer | null; error: string | null }> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const updateData: any = {};

      if (payload.firstName) updateData.first_name = payload.firstName;
      if (payload.lastName) updateData.last_name = payload.lastName;
      if (payload.email) updateData.email = payload.email;
      if (payload.phone) updateData.phone = payload.phone;
      if (payload.addressLine1) updateData.address_line_1 = payload.addressLine1;
      if (payload.addressLine2 !== undefined) updateData.address_line_2 = payload.addressLine2;
      if (payload.city) updateData.city = payload.city;
      if (payload.postcode) updateData.postcode = payload.postcode;

      const { data, error } = await supabase
        .from("customers")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .single();

      if (!error && data) {
        const updated: Customer = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          addressLine1: data.address_line_1,
          addressLine2: data.address_line_2,
          city: data.city,
          postcode: data.postcode,
          country: "United Kingdom",
          companyId: data.company_id || null,
          createdBy: data.created_by || "usr-1",
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        saveLocalCustomer(updated);
        return { customer: updated, error: null };
      }
    } catch (e: any) {
      console.error("Supabase updateCustomer failed", e);
    }
  }

  const local = getLocalCustomers();
  const target = local.find((c) => c.id === id);
  if (!target) return { customer: null, error: "Customer not found." };
  const updated: Customer = {
    ...target,
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  saveLocalCustomer(updated);
  return { customer: updated, error: null };
}

export async function deleteCustomer(id: string): Promise<{ success: boolean; error: string | null }> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();

      // 1. Fetch customer details
      const { data: customerData } = await supabase
        .from("customers")
        .select("id, email")
        .eq("id", id)
        .maybeSingle();

      const custEmail = customerData?.email;

      // 2. Query all proposals linked by customer_id OR customer_email
      const propIds: string[] = [];

      const { data: p1 } = await supabase.from("proposals").select("id").eq("customer_id", id);
      if (p1) p1.forEach((p) => propIds.push(p.id));

      if (custEmail) {
        const { data: p2 } = await supabase.from("proposals").select("id").eq("customer_email", custEmail);
        if (p2) p2.forEach((p) => propIds.push(p.id));
      }

      const uniquePropIds = Array.from(new Set(propIds));

      // 3. Clean up child tables and delete proposals
      if (uniquePropIds.length > 0) {
        for (const pId of uniquePropIds) {
          await supabase.from("solar_systems").delete().eq("proposal_id", pId);
          await supabase.from("financials").delete().eq("proposal_id", pId);
          await supabase.from("proposal_products").delete().eq("proposal_id", pId);
          await supabase.from("proposal_acceptance").delete().eq("proposal_id", pId);
          await supabase.from("proposal_blocks").delete().eq("proposal_id", pId);
          await supabase.from("payment_milestones").delete().eq("proposal_id", pId);
          await supabase.from("proposals").delete().eq("id", pId);
        }
      }

      // 4. Force delete remaining proposals matching customer_id
      await supabase.from("proposals").delete().eq("customer_id", id);

      // 5. Clean properties table
      await supabase.from("properties").delete().eq("customer_id", id);

      // 6. Delete customer record
      let { error } = await supabase.from("customers").delete().eq("id", id);

      // 7. If foreign key constraint still blocks deletion (e.g. RLS on proposals delete), disassociate customer_id first
      if (error && error.message.includes("foreign key constraint")) {
        console.warn("Attempting disassociation fallback for proposals foreign key:", error.message);
        await supabase.from("proposals").update({ customer_id: null as any }).eq("customer_id", id);
        const retry = await supabase.from("customers").delete().eq("id", id);
        error = retry.error;
      }

      if (error) {
        console.error("Supabase deleteCustomer error:", error.message);
      }
    } catch (e: any) {
      console.error("Supabase deleteCustomer exception:", e);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const current = getLocalCustomers();
      const filtered = current.filter((c) => c.id !== id);
      localStorage.setItem(LOCAL_STORAGE_CUSTOMERS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error("Error removing local customer", e);
    }
  }

  return { success: true, error: null };
}
