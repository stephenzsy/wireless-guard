import {
    IUserEntity
} from "./user-entity";
import {
    UserBase
} from "./user";
import {
    UserGroupBase
} from "./user-group";

export class BuiltInUser extends UserBase {
    constructor(id, name) {
        super(id, name);
    }

    /**
     *@override
     */
    public getMemberGroups(): IUserEntity[] {
        return null;
    }
}

export class BuiltInUserGroup extends UserGroupBase {
    constructor(id, name) {
        super(id, name);
    }

    /**
     *@override
     */
    public getMembers(): IUserEntity[] {
        return null;
    }
}

export module BuiltInUserEntityIds {
    export const rootUserId: string = "36363225-cd25-42aa-a2db-8b4f2c8d877f";

    export const rootUserGroupId: string = "b170b87a-516e-4e84-b1cb-1996c06d03e1";
}

namespace BuiltInUserEntities {
    export const rootUser: BuiltInUser = new BuiltInUser(BuiltInUserEntityIds.rootUserId, "root@root");
    export const rootUserGroup: BuiltInUserGroup = new BuiltInUserGroup(BuiltInUserEntityIds.rootUserGroupId, "root");
}
