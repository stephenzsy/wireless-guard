import Uuid from "../common/uuid";
import User from "./user";

export default class UserContributions {
    private contributedUsers: IDictionaryStringTo<User> = {};

    public contributeUser(id: string, name: string): User {
        this.contributedUsers[id] = this.contributedUsers[id] || new User(id, name);
        return this.contributedUsers[id];
    }

    public getContributedUser(id: string): User {
        return this.contributedUsers[id];
    }
}
