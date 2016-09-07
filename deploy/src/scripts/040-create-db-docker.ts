import * as path from "path";
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
const certsRelPath: string = "certs";
const certsDir: ConfigPath = dockerDir.path(certsRelPath).mkdirp();
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
const containerDestCerts: string = path.join(containerDest, "certs");

const sslCnf: string = [
    "[mysqld]",
    `ssl-ca=${path.join(containerDestCerts, serverCaChainRelPath)}`,
    `ssl-cert=${path.join(containerDestCerts, serverCertRelPath)}`,
    `ssl-key=${path.join(containerDestCerts, serverPrivateKeyRelPath)}`
].join("\n") + "\n";

const mysqlSslScriptPath = dockerDir.path("mysqld-ssl.cnf");
mysqlSslScriptPath.writeString(sslCnf);

const dbClientCertSuite = deployAppConfig.dbClientCert;
const clientCert = Secrets.loadClientCert(dbUserContext, dbClientCertSuite.certId);

// initialization SQL
const initSql: string = [
    "DELETE FROM mysql.user",
    `CREATE USER 'root'@'%' REQUIRE SUBJECT '${clientCert.subject}' AND ISSUER '${clientCert.issuer}'`,
    "GRANT ALL ON *.* TO 'root'@'%' WITH GRANT OPTION",
    "DROP DATABASE IF EXISTS test",
    "FLUSH PRIVILEGES"
].join(" ;\n") + " ;\n";
dockerDir.path("init.sql").writeString(initSql);

const dockerRunScriptPath = AppContext.getInstanceConfigPath("deploy").path("docker-run-dev.sh");
const runScript: string = [
    "#!/bin/bash",
    [
        "docker", "run",
        "-d",
        "-p", "13306:3306",
        "-v", `${dockerDir.fsPath}:/wireless-guard`,
        "wireless-guard-mysql"
    ].join(" ")
].join("\n") + "\n";
dockerRunScriptPath.writeString(runScript);
