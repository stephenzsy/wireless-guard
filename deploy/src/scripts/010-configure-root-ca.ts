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

if (!AppContext.hasConfig()) {
    throw "Config not available";
}

const caConfigPath = AppContext.getSettingsConfigPath().path("cert", "ca.json");

const caConfig = AppContext.getConfig<CaConfig>(caConfigPath);
console.log(caConfig);
