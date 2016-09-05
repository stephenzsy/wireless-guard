import * as fsExtra from "fs-extra";

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
const dbUserContext = AppContext.newContributedUserRequestContext("deploy", dbUser.id).elevate();

const dockerDir: ConfigPath = AppContext.getInstanceConfigPath("deploy").path("mysql-docker").mkdirp();
const certsDir: ConfigPath = dockerDir.path("certs").mkdirp();

const serverCertRelPath: string = "server-crt.pem";
const serverPrivateKeyRelPath: string = "server-key.pem";
const serverCaChainRelPath: string = "server-chain.pem";

// copy server cert, private key, ca cert
const dbCertSuite = deployAppConfig.dbServerCert;
const serverCert = Secrets.loadServerCert(dbUserContext, dbCertSuite.certId);
const serverPrivateKey = Secrets.loadPrivateKey(dbUserContext, dbCertSuite.privateKeyId);
fsExtra.copySync(serverCert.pemFilePath.fsPath, certsDir.path(serverCertRelPath).fsPath);
fsExtra.copySync(serverPrivateKey.pemFilePath.fsPath, certsDir.path(serverPrivateKeyRelPath).fsPath);
fsExtra.copySync(serverCert.caChainPemFilePath.fsPath, certsDir.path(serverCaChainRelPath).fsPath);

const containerDest: string = "/wireless-guard"
const mysqlSslScriptPath = dockerDir.path("mysqld-ssl.cnf");
const startScriptPath = dockerDir.path("start-mysql");
