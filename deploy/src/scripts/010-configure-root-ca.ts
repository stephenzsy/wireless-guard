import {
    AppContext,
    ConfigPath,
    BuiltInUserEntities,
    PrivateKey
} from "wireless-guard-common";

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

const caPrivateKeyPath: string = AppContext.getInstanceConfigPath().path("certs", "ca", "ca.key").ensureDirExists().fsPath;

async function configure() {
    await PrivateKey.createNewEcPrivateKeyAsync(BuiltInUserEntities.rootUser);
}

async function execute() {
    try {
        await configure();
    } catch (e) {
        console.error(e);
    }
}

execute();
