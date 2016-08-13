import {
    Guid,
    AppContext,
    Users,
} from "wireless-guard-common";
import * as BuiltinPolicies from "../policies/builtin-policies";
import { IRequestContext } from "../request-context";

type UserBase = Users.User.UserBase;
type IUserGroup = Users.UserGroup.IUserGroup;

module BuiltInUserEntityIds {
    export const dbServerUserId: Guid = new Guid("acc1592f-7cda-4d3c-a5ee-b12b0ea6b687");
    export const deploymentDbClientUserId: Guid = new Guid("3fd8fd0e-2501-4fce-bed3-30cc3ececa58");
}

namespace DeploymentUserEntities {
    class BuiltInUser extends UserBase {
        private groups: IDictionaryStringTo<BuiltInUserGroup> = {};

        /**
         *@override
         */
        public getMemberGroups(): IUserGroup[] {
            let result: BuiltInUserGroup[] = [];
            for (let id in this.groups) {
                result.push(this.groups[id]);
            }
            return result;
        }

        public _addToGroup(group: BuiltInUserGroup) {
            this.groups[group.id.toString()] = group;
        }


        public set policies(value: IPolicy[]) {
            this._policies = value.map(p => new Policy(p.id, p.name, p.actions, p.resources, p.effect));
        }
    }

    class BuiltInUserGroup extends UserGroupBase {
        private members: IDictionaryStringTo<BuiltInUser> = {};

        constructor(id, name) {
            super(id, name);
        }

        /**
         *@override
         */
        public getMembers(): IUserEntity[] {
            let result: BuiltInUser[] = [];
            for (let id in this.members) {
                result.push(this.members[id]);
            }
            return result;
        }

        public _addMember(user: BuiltInUser) {
            this.members[user.id.toString()] = user;
        }

        public set policies(value: IPolicy[]) {
            this._policies = value.map(p => new Policy(p.id, p.name, p.actions, p.resources, p.effect));
        }
    }

    export const systemUserGroup: BuiltInUserGroup = new BuiltInUserGroup(BuiltInUserEntityIds.rootUserGroupId, "system");

    export function createRootUser(): BuiltInUser {
        let user = new BuiltInUser(BuiltInUserEntityIds.rootUserId, "root@system");

        user._addToGroup(systemUserGroup);
        systemUserGroup._addMember(user);

        // attach user and group policies
        user.policies = [BuiltinPolicies.allowAll];

        return user;
    }

    export function createDbServerUser(): BuiltInUser {
        let user = new BuiltInUser(BuiltInUserEntityIds.dbServerUserId, "db-server@system");

        user._addToGroup(systemUserGroup);
        systemUserGroup._addMember(user);

        // attach user and group policies
        user.policies = [BuiltinPolicies.allowAll];

        return user;
    }
}

export const rootUser: IUser = BuiltInUserEntities.createRootUser();
export const dbServerUser: IUser = BuiltInUserEntities.createDbServerUser();
