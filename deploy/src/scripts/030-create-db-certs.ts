import {
    AppContext,
    ConfigPath,
    BuiltInUserEntities,
    PrivateKey,
    RequestContext,
    CaCert,
    CertCreateContext,
    Certificate
} from "wireless-guard-common";

if (!AppContext.hasConfig()) {
    throw "Config not available";
}

const caConfigPath = AppContext.getSettingsConfigPath().path("cert", "ca.json");
const caCertConfig = AppContext.getConfig<CertCreateContext.CertConfig>(caConfigPath);
const dbServerConfigPath = AppContext.getSettingsConfigPath().path("cert", "db-server.json");
const dbServerCertConfig = AppContext.getConfig<CertCreateContext.CertConfig>(dbServerConfigPath);

const certSubject = new CertCreateContext.CertSubject(caCertConfig.subject, dbServerCertConfig.subject);

const dbServerUserContext = RequestContext.newUserRequestContext(BuiltInUserEntities.dbServerUser);
const deploymentClientConfig = RequestContext.newUserRequestContext(BuiltInUserEntities.dbServerUser);

async function configureServerCertificate() {
    let privateKey = await PrivateKey.createNewRsaPrivateKeyAsync(dbServerUserContext);
    let caSuiteManifest = CaCert.BuiltInCaCertSuites.getDbCaCertSuiteConfig();
    let cert = await Certificate.createServerCertAsync(dbServerUserContext, privateKey, caSuiteManifest, dbServerCertConfig.days, certSubject.subject);
    Certificate.BuiltInCertSuites.setDbServerCertSuiteConfig({
        certId: cert.id.toString(),
        privateKeyId: privateKey.id.toString()
    });
}

async function configureClientCertificate() {

    let privateKey = await PrivateKey.createNewRsaPrivateKeyAsync(dbServerUserContext);
    let caSuiteManifest = CaCert.BuiltInCaCertSuites.getDbCaCertSuiteConfig();
    let cert = await Certificate.createServerCertAsync(dbServerUserContext, privateKey, caSuiteManifest, dbServerCertConfig.days, certSubject.subject);
    Certificate.BuiltInCertSuites.setDbServerCertSuiteConfig({
        certId: cert.id.toString(),
        privateKeyId: privateKey.id.toString()
    });
}

async function execute() {
    try {
        await configureServerCertificate();
    } catch (e) {
        console.error(e);
    }
}

execute();
