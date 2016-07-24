import { AppContext, ConfigPath } from "wireless-guard-common";

export interface CaConfig {
    country: string;
    stateOrProviceName: string;
    localityName: string;
    organizationName: string;
    organizationUnitName: string;
    commonName: string;
    emailAddress: string;
}

var configPath = new ConfigPath();

const caConfig = AppContext.getConfig<CaConfig>(configPath);
console.log(AppContext.hasConfig());
