import {
    Sequelize,
    Model as SequelizeModel,
    ModelAttributes,
    DataTypes,
} from "sequelize";

export module Columns {
  export const id: string = 'id';
  export const uid: string = 'uid';
}

export interface DataAccess<T extends SequelizeModel> {
  model: T
}

export abstract class DataAccessCommon<T extends SequelizeModel> implements DataAccess<T>{
  protected sqlize: Sequelize;
  private _model: T = null;

  constructor(sqlize: Sequelize) {
    this.sqlize = sqlize;
  }

  protected createModelAttributes(): ModelAttributes {
    var attributes: ModelAttributes = {};
    attributes[Columns.id] = {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    };
    attributes[Columns.uid] = {
      type: DataTypes.UUID,
      unique: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    };
    return attributes;
  }

  protected abstract createModel(): T;

  get model(): T {
    if (this._model) {
      return this._model;
    }
    this._model = this.createModel();
    return this._model;
  }
}
