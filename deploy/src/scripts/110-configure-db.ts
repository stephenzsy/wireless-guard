import * as path from "path";
import * as fsExtra from "fs-extra";
import * as sequelize from "sequelize";

import {
    AppContext,
    ConfigPath,
    RequestContext,
    Secrets
} from "wireless-guard-common";

import {
    IDataAccessService,
    DbConfig,
    createDataAccessService
} from "wireless-guard-data-access";

import {
    rootUser,
    dbUser,
} from "../lib/deploy-context";
import {
    DeployAppConfig,
    saveConfig,
    loadConfig
} from "../lib/config";
import AsyncScriptExecutor from "../lib/async-script-executor";

if (!AppContext.hasConfig()) {
    throw "Config not available";
}

const deployAppConfig: DeployAppConfig = loadConfig();
const dbUserContext = AppContext.newContributedUserRequestContext("deploy", dbUser.id).elevate();
const moduleConfigPath = AppContext.getInstanceConfigPath("deploy");
const dbConfigManaifest: DbConfig = moduleConfigPath.path("db-user-root.json").loadJsonConfig<DbConfig>();

const clientCertSuite = deployAppConfig.dbClientCert;

async function configureDb() {
    let service = await createDataAccessService(dbUserContext, dbConfigManaifest);
    let connection = service.connection;
    await connection.query("CREATE DATABASE IF NOT EXISTS wg");
    connection.close();
}

new AsyncScriptExecutor(configureDb).execute();
