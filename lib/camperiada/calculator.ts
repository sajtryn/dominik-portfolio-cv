// Pure build-summary calculations for the configurator (no React, no I/O).
import type { CatalogComponent } from "./configurator";

/** Only the fields the calculator needs — a subset of a catalogue item. */
export type CalculableComponent = Pick<CatalogComponent, "price" | "weightKg" | "installTimeHours">;

// VW T5 assumptions (kg).
export const VW_T5 = {
  /** Curb weight of the base van. */
  curbWeightKg: 1950,
  /** Gross vehicle weight rating (DMC). */
  maxGrossWeightKg: 3000,
  /** Recommended conversion budget — leaves margin for passengers and luggage. */
  recommendedConversionKg: 550,
} as const;

export const WORKDAY_HOURS = 8;
/** Load thresholds as % of the recommended conversion budget. */
export const DMC_WARNING_PERCENT = 80;
export const DMC_OVERLOAD_PERCENT = 100;

export type DmcStatusLevel = "OK" | "WARNING" | "OVERLOAD";

export type DmcStatus = {
  /** Estimated vehicle weight: curb weight + conversion. */
  totalVehicleWeightKg: number;
  /** Remaining payload up to the DMC (negative when exceeded). */
  remainingPayloadKg: number;
  /** Conversion weight as % of the recommended 550 kg budget (1 decimal). */
  conversionLoadPercent: number;
  status: DmcStatusLevel;
};

export type BuildSummary = {
  itemCount: number;
  /** Exact integer sum in grosze. */
  totalPriceGrosze: number;
  /** Rounded to 1 decimal. */
  totalWeightKg: number;
  /** Rounded to 1 decimal. */
  totalInstallHours: number;
  /** Workshop days assuming an 8-hour workday. */
  estimatedDays: number;
  dmcStatus: DmcStatus;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

export function getDmcStatus(conversionWeightKg: number): DmcStatus {
  const totalVehicleWeightKg = round1(VW_T5.curbWeightKg + conversionWeightKg);
  const remainingPayloadKg = round1(VW_T5.maxGrossWeightKg - totalVehicleWeightKg);
  const conversionLoadPercent = round1((conversionWeightKg / VW_T5.recommendedConversionKg) * 100);

  let status: DmcStatusLevel = "OK";
  if (conversionLoadPercent > DMC_OVERLOAD_PERCENT || remainingPayloadKg < 0) status = "OVERLOAD";
  else if (conversionLoadPercent >= DMC_WARNING_PERCENT) status = "WARNING";

  return { totalVehicleWeightKg, remainingPayloadKg, conversionLoadPercent, status };
}

export function calculateBuildSummary(selectedComponents: readonly CalculableComponent[]): BuildSummary {
  let totalPriceGrosze = 0;
  let weightSum = 0;
  let hoursSum = 0;
  for (const c of selectedComponents) {
    totalPriceGrosze += c.price; // integers — exact
    weightSum += c.weightKg;
    hoursSum += c.installTimeHours;
  }

  const totalWeightKg = round1(weightSum);
  const totalInstallHours = round1(hoursSum);

  return {
    itemCount: selectedComponents.length,
    totalPriceGrosze,
    totalWeightKg,
    totalInstallHours,
    estimatedDays: Math.ceil(totalInstallHours / WORKDAY_HOURS),
    dmcStatus: getDmcStatus(totalWeightKg),
  };
}
