import * as knex from "knex";
import {
    RequestContext,
    Secrets
} from "wireless-guard-common"

export interface IDataAccessService extends RequestContext.IService {
    connection: knex;
}

export interface DbConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    sslCertSuite: Secrets.ICertSuite;
}
