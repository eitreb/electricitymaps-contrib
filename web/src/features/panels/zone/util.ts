import { ZoneDetails } from 'types';
import { TimeAverages } from 'utils/constants';

import zonesConfigJSON from '../../../../config/zones.json'; // Todo: improve how to handle json configs

type zoneConfigItem = {
  aggregates_displayed?: string[];
  contributors?: string[];
  capacity?: any;
  disclaimer?: string;
  timezone?: string | null;
  bounding_box?: any;
  parsers?: any;
  estimation_method?: string;
  subZoneNames?: string[];
};

export const getHasSubZones = (zoneId?: string) => {
  if (!zoneId) {
    return null;
  }

  const config = zonesConfig[zoneId];
  if (!config || !config.subZoneNames) {
    return false;
  }
  return config.subZoneNames.length > 0;
};

export enum ZoneDataStatus {
  AGGREGATE_DISABLED = 'aggregate_disabled',
  NO_INFORMATION = 'no_information',
  NO_REAL_TIME_DATA = 'dark',
  AVAILABLE = 'available',
  UNKNOWN = 'unknown',
}

const zonesConfig: Record<string, zoneConfigItem | undefined> = zonesConfigJSON;
export const getZoneDataStatus = (
  zoneId: string,
  zoneDetails: ZoneDetails | undefined,
  timeAverage: TimeAverages
) => {
  // If there is no zoneDetails, we do not make any assumptions and return unknown
  if (!zoneDetails) {
    return ZoneDataStatus.UNKNOWN;
  }

  // If API returns hasData, we return available regardless
  if (zoneDetails.hasData) {
    return ZoneDataStatus.AVAILABLE;
  }

  // If there is no config for the zone, we assume we do not have any data
  const config = zonesConfig[zoneId];
  if (!config) {
    console.log(config);

    return ZoneDataStatus.NO_INFORMATION;
  }

  if (config.aggregates_displayed && !config.aggregates_displayed.includes(timeAverage)) {
    return ZoneDataStatus.AGGREGATE_DISABLED;
  }

  // If there are no production parsers or no defined estimation method in the config,
  // we assume we do not have data for the zone
  if (
    config.parsers?.production === undefined &&
    config.estimation_method === undefined
  ) {
    return ZoneDataStatus.NO_INFORMATION;
  }

  // Otherwise, we assume we have data but it is currently missing
  return ZoneDataStatus.NO_REAL_TIME_DATA;
};

export function getContributors(zoneId: string) {
  const config = zonesConfig[zoneId];
  return config?.contributors;
}

export function getDisclaimer(zoneId: string) {
  const config = zonesConfig[zoneId];
  return config?.disclaimer;
}
