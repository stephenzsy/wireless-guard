import {
    AppContext,
    ConfigPath,
    BuiltInUserEntities,
    PrivateKey,
    RequestContext,
    CaCert,
    CertCreateContext
} from "wireless-guard-common";

if (!AppContext.hasConfig()) {
    throw "Config not available";
}

const caConfigPath = AppContext.getSettingsConfigPath().path("cert", "ca.json");
const certConfig = AppContext.getConfig<CertCreateContext.CertConfig>(caConfigPath);
const certSubject = new CertCreateContext.CertSubject(certConfig.subject);

const rootUserContext = RequestContext.newUserRequestContext(BuiltInUserEntities.rootUser);

async function configureEcCertificate() {
    let privateKey = await PrivateKey.createNewEcPrivateKeyAsync(rootUserContext);
    let cert = await CaCert.createRootCaCertAsync(rootUserContext,
        privateKey,
        certSubject.subject);
    CaCert.BuiltInCaCertSuites.setCaCertSuiteConfig({
        certId: cert.id.toString(),
        privateKeyId: privateKey.id.toString()
    });
}

async function configureRsaCertificate() {
    let privateKey = await PrivateKey.createNewRsaPrivateKeyAsync(rootUserContext);
    let cert = await CaCert.createRootCaCertAsync(rootUserContext,
        privateKey,
        certSubject.subject);
    CaCert.BuiltInCaCertSuites.setDbCaCertSuiteConfig({
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
