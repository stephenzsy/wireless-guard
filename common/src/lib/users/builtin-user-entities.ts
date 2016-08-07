import {
    IUserEntity
} from "./user-entity";
import {
    UserBase
} from "./user";
import {
    UserGroupBase
} from "./user-group";
import {
    IPolicy,
    Policy
} from "../policies/policy";
import Guid from "../common/guid";
import * as BuiltinPolicies from "../policies/builtin-policies";

module BuiltInUserEntityIds {
    export const rootUserId: Guid = new Guid("36363225-cd25-42aa-a2db-8b4f2c8d877f");

    export const rootUserGroupId: Guid = new Guid("b170b87a-516e-4e84-b1cb-1996c06d03e1");
}

namespace BuiltInUserEntities {
    class BuiltInUser extends UserBase {
        private groups: IDictionaryStringTo<BuiltInUserGroup> = {};
        private _policies: Policy[];

        constructor(id, name) {
            super(id, name);
        }

        /**
         *@override
         */
        public getMemberGroups(): IUserEntity[] {
            let result: BuiltInUserGroup[] = [];
            for (let id in this.groups) {
                result.push(this.groups[id]);
            }
            return result;
        }

        public _addToGroup(group: BuiltInUserGroup) {
            this.groups[group.id.toString()] = group;
        }

        /**
         * @override
         */
        public getPolicies(): IPolicy[] {
            return this._policies.map(p => ({
                id: p.id,
                name: p.name,
                actions: p.actions,
                resources: p.resources,
                effect: p.effect
            }));
        }

        public set policies(value: IPolicy[]) {
            this._policies = value.map(p => new Policy(p.id, p.name, p.actions, p.resources, p.effect));
        }
    }

    class BuiltInUserGroup extends UserGroupBase {
        private members: IDictionaryStringTo<BuiltInUser> = {};
        private _policies: Policy[];

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

        /**
         * @override
         */
        public getPolicies(): IPolicy[] {
            return this._policies.map(p => ({
                id: p.id,
                name: p.name,
                actions: p.actions,
                resources: p.resources,
                effect: p.effect
            }));
        }

        public set policies(value: IPolicy[]) {
            this._policies = value.map(p => new Policy(p.id, p.name, p.actions, p.resources, p.effect));
        }
    }

    function createRootUserAndGroup(): {
        user: BuiltInUser,
        group: BuiltInUserGroup
    } {
        let user = new BuiltInUser(BuiltInUserEntityIds.rootUserId, "root@root");
        let group = new BuiltInUserGroup(BuiltInUserEntityIds.rootUserGroupId, "root");

        user._addToGroup(group);
        group._addMember(user);

        // attach user and group policies
        user.policies = [BuiltinPolicies.allowAll];
        group.policies = [BuiltinPolicies.allowAll];

        return {
            user: user,
            group: group
        };
    }

    export const rootUserAndGroup = createRootUserAndGroup();
}

export const rootUser: IUserEntity = BuiltInUserEntities.rootUserAndGroup.user;
