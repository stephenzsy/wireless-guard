import {
    AppContext,
    ConfigPath,
    BuiltInUserEntities,
    PrivateKey,
    RequestContext,
    CaCert,
    CertSubject
} from "wireless-guard-common";

if (!AppContext.hasConfig()) {
    throw "Config not available";
}

const caConfigPath = AppContext.getSettingsConfigPath().path("cert", "ca.json");
const certSubjectConfig = AppContext.getConfig<CertSubject.CertSubjectConfig>(caConfigPath);
const certSubject = new CertSubject.CertSubject(certSubjectConfig);

const rootUserContext = RequestContext.newUserRequestContext(BuiltInUserEntities.rootUser);

async function configureEcCertificate() {
    let privateKey = await PrivateKey.createNewEcPrivateKeyAsync(rootUserContext);
    let cert = await CaCert.createRootCaCertAsync(rootUserContext,
        privateKey,
        certSubject.subject);
    CaCert.BuiltInCaCertSuites.setCaCertSuiteManifest({
        certId: cert.id.toString(),
        privateKeyId: privateKey.id.toString()
    });
}

async function configureRsaCertificate() {
    let privateKey = await PrivateKey.createNewRsaPrivateKeyAsync(rootUserContext);
    let cert = await CaCert.createRootCaCertAsync(rootUserContext,
        privateKey,
        certSubject.subject);
    CaCert.BuiltInCaCertSuites.setDbCaCertSuiteManifest({
        certId: cert.id.toString(),
        privateKeyId: privateKey.id.toString()
    });
}

async function execute() {
    try {
        await configureEcCertificate();
        await configureRsaCertificate();
    } catch (e) {
        console.error(e);
    }
}

execute();
