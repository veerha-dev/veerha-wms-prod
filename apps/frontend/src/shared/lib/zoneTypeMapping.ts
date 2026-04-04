import type { ZoneType } from "@/shared/types/mapping";

// Backend enum: ZoneType from Prisma schema
export type DbZoneType =
  | "receiving"
  | "storage"
  | "picking"
  | "packing"
  | "shipping"
  | "returns"
  | "staging"
  | "cold"
  | "hazmat";

export const uiZoneTypeToDb = (ui: ZoneType): DbZoneType => {
  switch (ui) {
    case "receiving":
      return "receiving";
    case "storage":
      return "storage";
    case "picking":
      return "picking";
    case "packing":
      return "packing";
    case "shipping":
      return "shipping";
    case "returns":
      return "returns";
    case "cold-storage":
      return "cold";
    case "hazardous":
      return "hazmat";
    case "bulk":
      return "staging";
    case "fast-moving":
      return "picking";
    default:
      return "storage";
  }
};

export const dbZoneTypeToUi = (db: string | null | undefined): ZoneType => {
  switch (db) {
    case "receiving":
      return "receiving";
    case "storage":
      return "storage";
    case "picking":
      return "picking";
    case "packing":
      return "packing";
    case "shipping":
      return "shipping";
    case "returns":
      return "returns";
    case "staging":
      return "bulk";
    case "cold":
      return "cold-storage";
    case "hazmat":
      return "hazardous";
    default:
      return "storage";
  }
};
