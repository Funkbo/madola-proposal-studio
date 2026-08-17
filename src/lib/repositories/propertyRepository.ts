import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { getSupabaseEnv } from "@/lib/supabase/config";

export interface PropertyData {
  id?: string;
  customerId: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postcode: string;
  propertyType?: string;
  roofType?: string;
  roofMaterial?: string;
  roofPitch?: string;
  roofDirection?: string;
  annualEnergyConsumption?: number;
  annualEnergyBill?: number;
  electricitySupplier?: string;
  tariff?: string;
  mpan?: string;
  smartMeter?: boolean;
  threePhase?: boolean;
}

const LOCAL_STORAGE_PROPERTIES_KEY = "madola_saved_properties_list";

function getLocalProperties(): PropertyData[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PROPERTIES_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading local properties fallback", e);
  }
  return [];
}

function saveLocalProperty(prop: PropertyData) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalProperties();
    const updated = [prop, ...current.filter((p) => p.id !== prop.id)];
    localStorage.setItem(LOCAL_STORAGE_PROPERTIES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving local property fallback", e);
  }
}

export async function getPropertyByCustomerId(customerId: string): Promise<PropertyData | null> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("customer_id", customerId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          customerId: data.customer_id,
          addressLine1: data.address_line_1,
          addressLine2: data.address_line_2,
          city: data.city,
          postcode: data.postcode,
          propertyType: data.property_type,
          roofType: data.roof_type,
          roofMaterial: data.roof_material,
          roofPitch: data.roof_pitch,
          roofDirection: data.roof_direction,
          annualEnergyConsumption: data.annual_energy_consumption,
          annualEnergyBill: data.annual_energy_bill,
          electricitySupplier: data.electricity_supplier,
          tariff: data.tariff,
          mpan: data.mpan,
          smartMeter: data.smart_meter,
          threePhase: data.three_phase,
        };
      }
    } catch (e) {
      console.warn("Supabase getPropertyByCustomerId failed; using local fallback", e);
    }
  }

  const local = getLocalProperties();
  return local.find((p) => p.customerId === customerId) || null;
}

export async function createProperty(
  payload: PropertyData
): Promise<{ property: PropertyData | null; error: string | null }> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from("properties")
        .insert({
          customer_id: payload.customerId,
          address_line_1: payload.addressLine1,
          address_line_2: payload.addressLine2 || null,
          city: payload.city,
          postcode: payload.postcode,
          property_type: payload.propertyType || "Residential Detached",
          roof_type: payload.roofType || "Pitched",
          roof_material: payload.roofMaterial || "Concrete Tile",
          roof_pitch: payload.roofPitch || "35 degrees",
          roof_direction: payload.roofDirection || "South",
          annual_energy_consumption: payload.annualEnergyConsumption || 4200,
          annual_energy_bill: payload.annualEnergyBill || 1450,
          electricity_supplier: payload.electricitySupplier || "Octopus Energy",
          tariff: payload.tariff || "Flexible Octopus",
          mpan: payload.mpan || null,
          smart_meter: payload.smartMeter ?? true,
          three_phase: payload.threePhase ?? false,
        })
        .select()
        .single();

      if (!error && data) {
        const created: PropertyData = {
          id: data.id,
          customerId: data.customer_id,
          addressLine1: data.address_line_1,
          addressLine2: data.address_line_2,
          city: data.city,
          postcode: data.postcode,
          propertyType: data.property_type,
          roofType: data.roof_type,
          roofMaterial: data.roof_material,
          roofPitch: data.roof_pitch,
          roofDirection: data.roof_direction,
          annualEnergyConsumption: data.annual_energy_consumption,
          annualEnergyBill: data.annual_energy_bill,
          electricitySupplier: data.electricity_supplier,
          tariff: data.tariff,
          mpan: data.mpan,
          smartMeter: data.smart_meter,
          threePhase: data.three_phase,
        };
        saveLocalProperty(created);
        return { property: created, error: null };
      }
    } catch (e: any) {
      console.warn("Supabase createProperty failed; using local fallback", e);
    }
  }

  const fallback: PropertyData = {
    ...payload,
    id: `prop-local-${Date.now()}`,
  };
  saveLocalProperty(fallback);
  return { property: fallback, error: null };
}
