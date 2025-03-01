import {
  ElectricityModeType,
  ElectricityStorageKeyType,
  GenerationType,
  ZoneDetail,
} from 'types';
import { Mode } from 'utils/constants';
import { getProductionCo2Intensity } from 'utils/helpers';

import {
  getElectricityProductionValue,
  getTotalElectricity,
  getTotalEmissions,
} from './graphUtils';

export function getProductionTooltipData(
  selectedLayerKey: ElectricityModeType,
  zoneDetail: ZoneDetail,
  displayByEmissions: boolean,
  mixMode: Mode
) {
  const co2Intensity = getProductionCo2Intensity(selectedLayerKey, zoneDetail);
  const isStorage = selectedLayerKey.includes('storage');

  const generationType = isStorage
    ? (selectedLayerKey.replace(' storage', '') as GenerationType)
    : (selectedLayerKey as GenerationType);

  const storageKey = generationType as ElectricityStorageKeyType;

  const totalElectricity = getTotalElectricity(zoneDetail, mixMode);
  const totalEmissions = getTotalEmissions(zoneDetail, mixMode);

  const {
    capacity,
    production,
    storage,
    dischargeCo2IntensitySources,
    productionCo2IntensitySources,
    zoneKey,
  } = zoneDetail;

  const co2IntensitySource = isStorage
    ? (dischargeCo2IntensitySources || {})[storageKey]
    : (productionCo2IntensitySources || {})[generationType];

  const generationTypeCapacity = capacity ? capacity[selectedLayerKey] : undefined;
  const generationTypeProduction = production[generationType];

  const generationTypeStorage = storageKey ? storage[storageKey] : 0;

  const electricity = getElectricityProductionValue({
    generationTypeCapacity,
    isStorage,
    generationTypeStorage,
    generationTypeProduction,
  });
  const isExport = electricity ? electricity < 0 : false;

  let usage = electricity === 0 ? 0 : Number.NaN;
  let emissions = electricity === 0 ? 0 : Number.NaN;

  if (electricity && Number.isFinite(electricity)) {
    usage = Math.abs(
      displayByEmissions ? electricity * co2Intensity * 1000 : electricity
    );
    emissions = Math.abs(electricity * co2Intensity * 1000);
  }

  return {
    co2Intensity,
    co2IntensitySource,
    displayByEmissions,
    totalElectricity,
    totalEmissions,
    emissions,
    usage,
    zoneKey,
    isExport,
    production: generationTypeProduction,
    capacity: generationTypeCapacity,
    storage: generationTypeStorage,
  };
}

export function getExchangeTooltipData(
  exchangeKey: string,
  zoneDetail: ZoneDetail,
  displayByEmissions: boolean
) {
  const { zoneKey, exchangeCo2Intensities, exchangeCapacities } = zoneDetail;

  const co2Intensity = exchangeCo2Intensities[exchangeKey];

  const exchangeCapacityRange = (exchangeCapacities || {})[exchangeKey];
  const exchange = (zoneDetail.exchange || {})[exchangeKey];

  const isExport = exchange < 0;

  const usage = Math.abs(displayByEmissions ? exchange * co2Intensity * 1000 : exchange);
  const totalElectricity = getTotalElectricity(zoneDetail, Mode.CONSUMPTION);
  const totalCapacity = exchangeCapacityRange
    ? Math.abs(exchangeCapacityRange[isExport ? 0 : 1])
    : undefined;
  const emissions = Math.abs(exchange * co2Intensity * 1000);
  const totalEmissions = getTotalEmissions(
    zoneDetail,

    Mode.CONSUMPTION
  );

  return {
    co2Intensity,
    displayByEmissions,
    totalElectricity,
    totalEmissions,
    emissions,
    usage,
    zoneKey,
    isExport,
    capacity: totalCapacity,
  };
}
