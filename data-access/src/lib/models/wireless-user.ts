import {
    Sequelize,
    Model as SequelizeModel,
    DataTypes,
    ModelAttributes
} from "sequelize";

import {
    DataAccess,
    DataAccessCommon
} from "./common";

namespace Columns {
    export const Username: string = 'username';
    export const Email: string = 'email';
    export const Type: string = 'type';
}

export module UserTypeStr {
    export const Unknown: string = 'UNKNOWN';
    export const System: string = 'SYSTEM';
    export const Login: string = 'LOGIN';
    export const Network: string = 'NETWORK';
}

export class WirelessUserModel extends SequelizeModel {
}

export class DataAccessWirelessUser extends DataAccessCommon<WirelessUserModel> {
    protected createModelAttributes(): ModelAttributes {
        var attributes = super.createModelAttributes();
        attributes[Columns.Username] = {
            type: DataTypes.STRING(64),
            unique: true,
            allowNull: false
        };
        attributes[Columns.Email] = {
            type: DataTypes.STRING(256),
            allowNull: false
        };
        attributes[Columns.Type] = {
            type: DataTypes.ENUM([
                UserTypeStr.System,
                UserTypeStr.Login,
                UserTypeStr.Network
            ])
        };
        return attributes;
    }

    protected createModel(): WirelessUserModel {
        return this.sqlize.define<WirelessUserModel>("wireless_user", this.createModelAttributes(), {});
    }
}
