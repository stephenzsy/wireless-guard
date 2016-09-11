import * as tls from "tls";

import * as knex from "knex";

import {
    RequestContext,
    Secrets,
    Uuid
} from "wireless-guard-common";

import {
    IDataAccessService,
    DbConfig
} from "./interfaces";

class DataAccessService implements IDataAccessService {
    private _serviceTypeId: Uuid;
    private _connection: knex;

    constructor(connection: knex) {
        this._serviceTypeId = new Uuid();
        this._connection = connection;
    }

    public get serviceTypeId(): Uuid {
        return this._serviceTypeId;
    }

    public get connection(): knex {
        return this._connection;
    }
}

export async function createDataAccessService(
    requestContext: RequestContext.IRequestContext,
    dbConfig: DbConfig): Promise<IDataAccessService> {
    let clientCert = Secrets.loadClientCert(requestContext, dbConfig.sslCertSuite.certId)
    let cert: Buffer = await clientCert.readCertificate(requestContext);
    let caChain: Buffer = await clientCert.readCaChain(requestContext);
    let elevatedContext = requestContext.elevate();
    let key: Buffer = await Secrets.loadPrivateKey(elevatedContext, dbConfig.sslCertSuite.privateKeyId).readPrivateKey(elevatedContext);
    let SecureContextOptions: tls.SecureContextOptions = {
        ca: caChain,
        cert: cert,
        key: key
    }
    let conn: knex = knex({
        dialect: "mysql2",
        connection: {
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.username,
            password: dbConfig.password,
            database: dbConfig.database,
            ssl: SecureContextOptions
        } as knex.ConnectionConfig
    });
    return new DataAccessService(conn);
}
