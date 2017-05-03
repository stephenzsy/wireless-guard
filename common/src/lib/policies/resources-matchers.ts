import {
    IPolicyResourcesMatcher
} from "./interfaces";

export class PolicyResourceSelfMatcher<R> implements IPolicyResourcesMatcher<R> {
    private readonly resourceInstance: R;
    constructor(resourceInstance: R) {
        this.resourceInstance = resourceInstance;
    }

    public matches(target: R): boolean {
        return (this.resourceInstance === target);
    }
}
