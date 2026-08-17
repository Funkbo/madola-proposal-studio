-- Day 2 Seed Script for Development / Testing Environments

-- Insert Default Hardware Products
INSERT INTO public.products (id, category, manufacturer, model, description, capacity, unit, active)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'panel', 'SolarEdge', 'Smart Module 415W', '415W Monocrystalline solar PV panel with integrated power optimizer', 415, 'W', true),
  ('10000000-0000-0000-0000-000000000002', 'battery', 'GivEnergy', 'All-in-One 13.5kWh', '13.5kWh LFP Storage with 6kW Peak Discharge Output', 13.5, 'kWh', true),
  ('10000000-0000-0000-0000-000000000003', 'inverter', 'Solis', '3.6kW Single Phase Hybrid', 'Dual MPPT hybrid inverter with G98 UK grid compliance', 3.6, 'kW', true),
  ('10000000-0000-0000-0000-000000000004', 'ev_charger', 'Myenergi', 'Zappi v2.1 7.2kW', 'Smart EV charger with eco+ solar surplus charging mode', 7.2, 'kW', true)
ON CONFLICT (id) DO NOTHING;

-- Insert Default Proposal Templates
INSERT INTO public.proposal_templates (id, name, description, active)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'UK Residential Solar + Storage', 'Standard layout for domestic UK installations including PV array, GivEnergy battery storage, MCS compliance, and SEG calculations.', true),
  ('20000000-0000-0000-0000-000000000002', 'Commercial Roof PV Pitch', 'High-capacity commercial proposal template with G99 grid details and ROI breakdown.', true)
ON CONFLICT (id) DO NOTHING;
