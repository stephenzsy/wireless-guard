import * as tls from "tls";

import { Sequelize, Options as SequelizeOptions } from "sequelize";
import * as _sequelize from "sequelize";
const sequelize: any = _sequelize;

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
    private _serviceTypeId: string;
    private _connection: Sequelize;

    constructor(connection: Sequelize) {
        this._serviceTypeId = Uuid.v4();
        this._connection = connection;
    }

    public get serviceTypeId(): string {
        return this._serviceTypeId;
    }

    public get connection(): Sequelize {
        return this._connection;
    }
}

export async function createDataAccessService(
    requestContext: RequestContext.IRequestContext,
    dbConfig: DbConfig): Promise<IDataAccessService> {
    let clientCert = Secrets.loadClientCert(requestContext, dbConfig.sslCertSuite.certId)
    let cert: Buffer = await clientCert.readCertificate(requestContext);
    let caChain: Buffer = await clientCert.readCaChain(requestContext);
    let key: Buffer = await Secrets.loadPrivateKey(requestContext, dbConfig.sslCertSuite.privateKeyId).readPrivateKey(requestContext);
    let secureContextOptions: tls.SecureContextOptions = {
        ca: caChain,
        cert: cert,
        key: key
    }
    let conn: Sequelize = new sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
        dialect: "mysql",
        host: dbConfig.host,
        port: dbConfig.port,
        dialectOptions: {
            ssl: secureContextOptions
        }
    });
    return new DataAccessService(conn);
}
