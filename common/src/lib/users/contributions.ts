import Guid from "../common/guid";
import User from "./user";

export default class UserContributions {
    private contributedUsers: IDictionaryStringTo<User> = {};

    public contributeUser(id: Guid, name: string): User {
        let idStr = id.toString();
        this.contributedUsers[idStr] = this.contributedUsers[idStr] || new User(id, name);
        return this.contributedUsers[idStr];
    }

    public getContributedUser(id: Guid): User {
        let idStr = id.toString();
        return this.contributedUsers[idStr];
    }
}
