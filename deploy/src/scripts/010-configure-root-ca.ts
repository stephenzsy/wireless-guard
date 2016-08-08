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
const certSubject = new CertSubject.CertSubject(certSubjectConfig)

async function configure() {
    let requestContext = RequestContext.newUserRequestContext(BuiltInUserEntities.rootUser);
    let privateKey = await PrivateKey.createNewEcPrivateKeyAsync(requestContext);
    await CaCert.createRootCaCertAsync(requestContext,
        privateKey,
        0,
        certSubject.subject);

}

async function execute() {
    try {
        await configure();
    } catch (e) {
        console.error(e);
    }
}

execute();
