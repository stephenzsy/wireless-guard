import {
    AppContext,
    ConfigPath,
    Users,
    Secrets,
    RequestContext,
} from "wireless-guard-common";
import {
    rootUser,
} from "../lib/deploy-context";
import {
    DeployAppConfig,
    saveConfig,
    loadConfig
} from "../lib/config";
if (!AppContext.hasConfig()) {
    throw "Config not available";
}

const deployAppConfig: DeployAppConfig = loadConfig();

const caConfigPath = AppContext.getSettingsConfigPath().path("cert", "ca.json");
const certConfig = AppContext.getConfig<Secrets.CreateCertConfig>(caConfigPath);
const certSubject = new Secrets.CertSubject(certConfig.subject);

const rootUserContext = AppContext.newContributedUserRequestContext("deploy", rootUser.id).elevate();

async function configureRootCaCertificate(): Promise<Secrets.ICertSuite> {
    return Secrets.createEcRootCaCertSuiteAsync(rootUserContext,
        certSubject.subject);
}

async function configureDbCaCertificate(): Promise<Secrets.ICertSuite> {
    return Secrets.createRsaRootCaCertSuiteAsync(rootUserContext,
        certSubject.subject);
}

async function execute() {
    try {
        deployAppConfig.rootCaCert = await configureRootCaCertificate();
        deployAppConfig.dbCaCert = await configureDbCaCertificate();
        saveConfig(deployAppConfig);
    } catch (e) {
        console.error(e);
    }
}

execute();
