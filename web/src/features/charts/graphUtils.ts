/* eslint-disable unicorn/no-null */
import { bisectLeft } from 'd3-array';
// import { pointer } from 'd3-selection';
// // https://observablehq.com/@d3/d3-selection-2-0
import { scaleTime } from 'd3-scale';
import { pointer } from 'd3-selection';
import { ElectricityStorageType, GenerationType, Maybe, ZoneDetail } from 'types';
import { Mode, modeOrder } from 'utils/constants';

export const detectHoveredDatapointIndex = (
  event_: any,
  datetimes: any,
  timeScale: any,
  svgNode: any
) => {
  if (datetimes.length === 0) {
    return null;
  }
  const timeIntervalWidth = timeScale(datetimes[1]) - timeScale(datetimes[0]);

  const dx = event_.pageX
    ? event_.pageX - svgNode.getBoundingClientRect().left
    : pointer(event_)[0];
  const adjustedDx = dx - timeIntervalWidth / 2;
  const datetime = timeScale.invert(adjustedDx);

  // Find data point closest to
  let index = bisectLeft(datetimes, datetime);
  if (index > 0 && datetime - datetimes[index - 1] < datetimes[index] - datetime) {
    index -= 1;
  }
  if (index > datetimes.length - 1) {
    index = datetimes.length - 1;
  }
  return index;
};

// If in mobile mode, put the tooltip to the top of the screen for
// readability, otherwise float it depending on the marker position.
export const getTooltipPosition = (isMobile: boolean, marker: { x: number; y: number }) =>
  isMobile ? { x: 0, y: 0 } : marker;

// TODO: Deprecate this
export const isEmpty = (object: any) =>
  [Object, Array].includes((object || {}).constructor) &&
  Object.entries(object || {}).length === 0;

export const noop = () => undefined;

export const getTimeScale = (width: number, startTime: Date, endTime: Date) =>
  scaleTime()
    .domain([new Date(startTime), new Date(endTime)])
    .range([0, width]);

export const getStorageKey = (name: ElectricityStorageType): string | undefined => {
  switch (name) {
    case 'hydro storage': {
      return 'hydro';
    }
    case 'battery storage': {
      return 'battery';
    }
    default: {
      return undefined;
    }
  }
};

export const getGenerationTypeKey = (name: string): GenerationType | undefined => {
  if (modeOrder.includes(name as GenerationType)) {
    return name as GenerationType;
  }

  return undefined;
};

export function getTotalElectricity(zoneData: ZoneDetail, mixMode: Mode) {
  const isConsumption = mixMode === Mode.CONSUMPTION;
  if (isConsumption) {
    if (zoneData.totalConsumption === null) {
      return Number.NaN;
    }
    return zoneData.totalConsumption;
  }
  if (zoneData.totalProduction === null) {
    return Number.NaN;
  }
  // Electricity: Handle discharge case if available, else default to production
  return zoneData.totalProduction + (zoneData.totalDischarge ?? 0);
}

export function getTotalEmissions(zoneData: ZoneDetail, mixMode: Mode) {
  const isConsumption = mixMode === Mode.CONSUMPTION;
  if (isConsumption) {
    if (zoneData.totalCo2Consumption === null) {
      return Number.NaN;
    }
    return zoneData.totalCo2Consumption;
  }
  if (zoneData.totalCo2Production === null) {
    return Number.NaN;
  }
  // Emissions: Handle discharge case if available, else default to production
  return zoneData.totalCo2Production + (zoneData.totalCo2Discharge ?? 0);
}

export const getNextDatetime = (datetimes: Date[], currentDate: Date) => {
  const index = datetimes.findIndex((d) => d?.getTime() === currentDate?.getTime());
  return datetimes[index + 1];
};

export function getRatioPercent(value: Maybe<number>, total: Maybe<number>) {
  // If both the numerator and denominator are zeros,
  // interpret the ratio as zero instead of NaN.
  if (value === 0 && total === 0) {
    return 0;
  }
  if (
    Number.isNaN(value) ||
    typeof value !== 'number' ||
    typeof total !== 'number' ||
    total === 0
  ) {
    return '?';
  }
  return Math.round((value / total) * 10_000) / 100;
}

export function getElectricityProductionValue({
  generationTypeCapacity,
  isStorage,
  generationTypeProduction,
  generationTypeStorage,
}: {
  generationTypeCapacity: Maybe<number>;
  isStorage: boolean;
  generationTypeProduction: Maybe<number>;
  generationTypeStorage: Maybe<number>;
}) {
  const value = isStorage ? generationTypeStorage : generationTypeProduction;

  // If the value is not defined but the capacity
  // is zero, assume the value is also zero.
  if (!Number.isFinite(value) && generationTypeCapacity === 0) {
    return 0;
  }

  if (!isStorage) {
    return value;
  }

  // Handle storage scenarios
  if (generationTypeStorage === null || generationTypeStorage === undefined) {
    return null;
  }
  // Do not negate value if it is zero
  return generationTypeStorage === 0 ? 0 : -generationTypeStorage;
}
