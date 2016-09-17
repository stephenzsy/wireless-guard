import { Sequelize } from "sequelize";

import {
    RequestContext,
    Secrets
} from "wireless-guard-common"

export interface IDataAccessService extends RequestContext.IService {
    connection: Sequelize;
}

export interface DbConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    sslCertSuite: Secrets.ICertSuite;
}
