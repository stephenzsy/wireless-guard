import {
    AppContext,
    ConfigPath,
    RequestContext,
    Secrets
} from "wireless-guard-common";
import {
    rootUser,
    dbUser,
} from "../lib/deploy-context";
import {
    DeployAppConfig,
    saveConfig,
    loadConfig
} from "../lib/config";

const deployAppConfig: DeployAppConfig = loadConfig();

const caConfigPath = AppContext.getSettingsConfigPath().path("cert", "ca.json");
const caCertConfig = AppContext.getConfig<Secrets.CreateCertConfig>(caConfigPath);
const dbServerConfigPath = AppContext.getSettingsConfigPath().path("cert", "db-server.json");
const dbServerCertConfig = AppContext.getConfig<Secrets.CreateCertConfig>(dbServerConfigPath);

const certSubject = new Secrets.CertSubject(caCertConfig.subject, dbServerCertConfig.subject);

const dbUserContext = AppContext.newContributedUserRequestContext("deploy", dbUser.id).elevate();

async function configureServerCertificate(): Promise<Secrets.ICertSuite> {
    let privateKey = await Secrets.createNewRsaPrivateKeyAsync(dbUserContext);
    let caSuiteManifest = deployAppConfig.dbCaCert;
    let cert = await Secrets.createServerCertAsync(dbUserContext, privateKey, caSuiteManifest, dbServerCertConfig.days, certSubject.subject);
    return {
        certId: cert.id,
        privateKeyId: privateKey.id
    };
}

async function configureClientCertificate(): Promise<Secrets.ICertSuite> {
    let privateKey = await Secrets.createNewRsaPrivateKeyAsync(dbUserContext);
    let caSuiteManifest = deployAppConfig.dbCaCert;
    let cert = await Secrets.createClientCertAsync(dbUserContext, privateKey, caSuiteManifest, dbServerCertConfig.days, certSubject.subject);
    return {
        certId: cert.id,
        privateKeyId: privateKey.id
    };
}

async function execute() {
    try {
        deployAppConfig.dbServerCert = await configureServerCertificate();
        deployAppConfig.dbClientCert = await configureClientCertificate();
        saveConfig(deployAppConfig);
    } catch (e) {
        console.error(e);
    }
}

execute();
