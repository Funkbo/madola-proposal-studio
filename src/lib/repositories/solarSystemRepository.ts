import { getSupabaseClient } from "@/lib/supabase/getSupabaseClient";
import { getSupabaseEnv } from "@/lib/supabase/config";

export interface SolarSystemData {
  id?: string;
  proposalId: string;
  systemSizeKwp: number;
  panelCount: number;
  panelWattage: number;
  panelManufacturer: string;
  panelModel: string;
  inverterManufacturer?: string;
  inverterModel?: string;
  inverterCapacityKw?: number;
  batteryManufacturer?: string;
  batteryModel?: string;
  batteryCapacityKwh?: number;
  annualGenerationKwh?: number;
  annualConsumptionKwh?: number;
  selfConsumptionPercent?: number;
  selfSufficiencyPercent?: number;
  exportKwh?: number;
}

const LOCAL_STORAGE_SOLAR_SYSTEMS_KEY = "madola_saved_solar_systems";

function getLocalSolarSystems(): SolarSystemData[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SOLAR_SYSTEMS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading local solar systems fallback", e);
  }
  return [];
}

function saveLocalSolarSystem(data: SolarSystemData) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalSolarSystems();
    const updated = [data, ...current.filter((s) => s.proposalId !== data.proposalId)];
    localStorage.setItem(LOCAL_STORAGE_SOLAR_SYSTEMS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving local solar system fallback", e);
  }
}

export async function getSolarSystemByProposalId(proposalId: string): Promise<SolarSystemData | null> {
  const { isConfigured } = getSupabaseEnv();

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from("solar_systems")
        .select("*")
        .eq("proposal_id", proposalId)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          proposalId: data.proposal_id,
          systemSizeKwp: Number(data.system_size_kwp) || 5.4,
          panelCount: data.panel_count || 12,
          panelWattage: data.panel_wattage || 450,
          panelManufacturer: data.panel_manufacturer || "LONGi",
          panelModel: data.panel_model || "Hi-MO X6 Max",
          inverterManufacturer: data.inverter_manufacturer || "Solis",
          inverterModel: data.inverter_model || "S6 Hybrid 5kW",
          inverterCapacityKw: Number(data.inverter_capacity_kw) || 5.0,
          batteryManufacturer: data.battery_manufacturer || "GivEnergy",
          batteryModel: data.battery_model || "All-In-One 13.5kWh",
          batteryCapacityKwh: Number(data.battery_capacity_kwh) || 13.5,
          annualGenerationKwh: Number(data.annual_generation_kwh) || 4850,
          annualConsumptionKwh: Number(data.annual_consumption_kwh) || 4200,
          selfConsumptionPercent: Number(data.self_consumption_percent) || 82,
          selfSufficiencyPercent: Number(data.self_sufficiency_percent) || 78,
          exportKwh: Number(data.export_kwh) || 870,
        };
      }
    } catch (e) {
      console.warn("Supabase getSolarSystemByProposalId failed; using local fallback", e);
    }
  }

  const local = getLocalSolarSystems();
  return local.find((s) => s.proposalId === proposalId) || null;
}

export async function saveSolarSystem(
  proposalId: string,
  data: SolarSystemData
): Promise<{ success: boolean; error: string | null }> {
  const { isConfigured } = getSupabaseEnv();

  const payload: SolarSystemData = {
    ...data,
    proposalId,
    systemSizeKwp: (data.panelCount * data.panelWattage) / 1000,
  };

  saveLocalSolarSystem(payload);

  if (isConfigured) {
    try {
      const supabase = await getSupabaseClient();

      const { error } = await supabase.from("solar_systems").upsert(
        {
          proposal_id: proposalId,
          system_size_kwp: payload.systemSizeKwp,
          panel_count: payload.panelCount,
          panel_wattage: payload.panelWattage,
          panel_manufacturer: payload.panelManufacturer,
          panel_model: payload.panelModel,
          inverter_manufacturer: payload.inverterManufacturer || "Solis",
          inverter_model: payload.inverterModel || "S6 Hybrid",
          inverter_capacity_kw: payload.inverterCapacityKw || 5.0,
          battery_manufacturer: payload.batteryManufacturer || "GivEnergy",
          battery_model: payload.batteryModel || "All-In-One 13.5kWh",
          battery_capacity_kwh: payload.batteryCapacityKwh || 13.5,
          annual_generation_kwh: payload.annualGenerationKwh || 4850,
          annual_consumption_kwh: payload.annualConsumptionKwh || 4200,
          self_consumption_percent: payload.selfConsumptionPercent || 82,
          self_sufficiency_percent: payload.selfSufficiencyPercent || 78,
          export_kwh: payload.exportKwh || 870,
        },
        { onConflict: "proposal_id" }
      );

      if (error) {
        console.warn("Supabase saveSolarSystem error:", error.message);
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (e: any) {
      console.warn("Supabase saveSolarSystem exception:", e);
      return { success: false, error: e.message };
    }
  }

  return { success: true, error: null };
}
