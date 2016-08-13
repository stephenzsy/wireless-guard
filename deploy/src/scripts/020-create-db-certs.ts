import {
    AppContext,
    ConfigPath,
    BuiltInUserEntities,
    PrivateKey,
    RequestContext,
    CaCert,
    CertSubject,
    ServerCert
} from "wireless-guard-common";

if (!AppContext.hasConfig()) {
    throw "Config not available";
}

const caConfigPath = AppContext.getSettingsConfigPath().path("cert", "ca.json");
const certSubjectConfig = AppContext.getConfig<CertSubject.CertSubjectConfig>(caConfigPath);
const dbServerConfigPath = AppContext.getSettingsConfigPath().path("cert", "db-server.json");
const dbServerSubjectConfig = AppContext.getConfig<CertSubject.CertSubjectConfig>(dbServerConfigPath);

const certSubject = new CertSubject.CertSubject(certSubjectConfig, dbServerSubjectConfig);

const dbServerUserContext = RequestContext.newUserRequestContext(BuiltInUserEntities.dbServerUser);

async function configureRsaCertificate() {
    let privateKey = await PrivateKey.createNewRsaPrivateKeyAsync(dbServerUserContext);
    let caSuiteManifest = CaCert.BuiltInCaCertSuites.getDbCaCertSuiteManifest();
    ServerCert.createServerCertAsync(dbServerUserContext, privateKey, caSuiteManifest, certSubject.subject);
}

async function execute() {
    try {
        await configureRsaCertificate();
    } catch (e) {
        console.error(e);
    }
}

execute();
