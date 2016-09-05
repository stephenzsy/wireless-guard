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
const rootUserContext = AppContext.newContributedUserRequestContext("deploy", rootUser.id).elevate();

async function configureServerCertificate(): Promise<Secrets.ICertSuite> {
    return Secrets.createRsaServerCertificateSuite(dbUserContext,
        rootUserContext,
        deployAppConfig.dbCaCert,
        dbServerCertConfig.days,
        certSubject.subject);
}

async function configureClientCertificate(): Promise<Secrets.ICertSuite> {
    return Secrets.createRsaClientCertificate(dbUserContext,
        rootUserContext,
        deployAppConfig.dbCaCert,
        dbServerCertConfig.days,
        certSubject.subject);
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
