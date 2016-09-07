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
const dbServerCertSubject = new Secrets.CertSubject(caCertConfig.subject, dbServerCertConfig.subject);
const dbClientConfigPath = AppContext.getSettingsConfigPath().path("cert", "db-client.json");
const dbClientCertConfig = AppContext.getConfig<Secrets.CreateCertConfig>(dbClientConfigPath);
const dbClientCertSubject = new Secrets.CertSubject(caCertConfig.subject, dbClientCertConfig.subject);

const dbUserContext = AppContext.newContributedUserRequestContext("deploy", dbUser.id).elevate();
const rootUserContext = AppContext.newContributedUserRequestContext("deploy", rootUser.id).elevate();

async function configureServerCertificate(): Promise<Secrets.ICertSuite> {
    return Secrets.createRsaServerCertificateSuite(dbUserContext,
        rootUserContext,
        deployAppConfig.dbCaCert,
        dbServerCertConfig.days,
        dbServerCertSubject.subject);
}

async function configureClientCertificate(): Promise<Secrets.ICertSuite> {
    return Secrets.createRsaClientCertificate(dbUserContext,
        rootUserContext,
        deployAppConfig.dbCaCert,
        dbClientCertConfig.days,
        dbClientCertSubject.subject);
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
