export interface MediaAsset {
  id: string;
  name: string;
  src: string;
  type: "image" | "icon";
  width?: number;
  height?: number;
  alt: string;
  category: "solar" | "battery" | "inverter" | "ev" | "installation" | "general";
  createdAt: string;
}
