import { ZoneDetail } from 'types';
import { Mode } from 'utils/constants';

import {
  getElectricityProductionValue,
  getRatioPercent,
  getTotalElectricity,
  getTotalEmissions,
} from './graphUtils';

describe('getRatioPercent', () => {
  it('handles 0 of 0', () => {
    const actual = getRatioPercent(0, 0);
    expect(actual).toEqual(0);
  });
  it('handles 10 of 0', () => {
    const actual = getRatioPercent(10, 0);
    expect(actual).toEqual('?');
  });
  it('handles 0 of 10', () => {
    const actual = getRatioPercent(0, 10);
    expect(actual).toEqual(0);
  });
  it('handles 5 of 5', () => {
    const actual = getRatioPercent(5, 5);
    expect(actual).toEqual(100);
  });
  it('handles 1 of 5', () => {
    const actual = getRatioPercent(1, 5);
    expect(actual).toEqual(20);
  });
});

describe('getElectricityProductionValue', () => {
  it('handles production', () => {
    const actual = getElectricityProductionValue({
      generationTypeCapacity: 61_370,
      isStorage: false,
      generationTypeStorage: undefined,
      generationTypeProduction: 41_161,
    });
    expect(actual).toEqual(41_161);
  });

  it('handles storage', () => {
    const actual = getElectricityProductionValue({
      generationTypeCapacity: 20_222.25,
      isStorage: true,
      generationTypeStorage: -3738.75,
      generationTypeProduction: 11_930.25,
    });
    expect(actual).toEqual(3738.75);
  });

  it('handles missing storage', () => {
    const actual = getElectricityProductionValue({
      generationTypeCapacity: 123,
      isStorage: true,
      generationTypeStorage: null,
      generationTypeProduction: 999,
    });
    expect(actual).toEqual(null);
  });

  it('handles zero storage', () => {
    const actual = getElectricityProductionValue({
      generationTypeCapacity: 123,
      isStorage: true,
      generationTypeStorage: 0,
      generationTypeProduction: 999,
    });
    expect(actual).toEqual(0);
  });

  it('handles zero production', () => {
    const actual = getElectricityProductionValue({
      generationTypeCapacity: 123,
      isStorage: false,
      generationTypeStorage: undefined,
      generationTypeProduction: 0,
    });
    expect(actual).toEqual(0);
  });

  it('handles null production', () => {
    const actual = getElectricityProductionValue({
      generationTypeCapacity: 16,
      isStorage: false,
      generationTypeStorage: undefined,
      generationTypeProduction: null,
    });
    expect(actual).toEqual(null);
  });
});

describe('getTotalEmissionsOrElectricity', () => {
  const zoneData = {
    totalCo2Production: 100,
    totalCo2Consumption: 175,
    totalConsumption: 350,
    totalCo2Discharge: 50,
    totalProduction: 200,
    totalDischarge: 50,
    totalImport: 100,
    totalCo2Import: 25,
  } as ZoneDetail;

  it('handles emissions for consumption', () => {
    const actual = getTotalEmissions(zoneData, Mode.CONSUMPTION);
    expect(actual).toEqual(175);
  });

  it('handles power for consumption', () => {
    const actual = getTotalElectricity(zoneData, Mode.CONSUMPTION);
    expect(actual).toEqual(350);
  });

  it('handles emissions for production', () => {
    const actual = getTotalEmissions(zoneData, Mode.PRODUCTION);
    expect(actual).toEqual(150);
  });

  it('handles power for production', () => {
    const actual = getTotalElectricity(zoneData, Mode.PRODUCTION);
    expect(actual).toEqual(250);
  });

  it('returns 0 when productionValue is 0', () => {
    const actual = getTotalElectricity(
      { ...zoneData, totalProduction: 0, totalDischarge: 0 },
      Mode.PRODUCTION
    );
    expect(actual).toEqual(0);
  });
});
