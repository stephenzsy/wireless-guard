import {AppContext} from "wireless-guard-common";

export interface CaConfig {
  country: string;
  stateOrProviceName: string;
  localityName: string;
  organizationName: string;
  organizationUnitName: string;
  commonName: string;
  emailAddress: string;
}

const caConfig = AppContext.getConfig<CaConfig>(null);
console.log(caConfig);
