import { IPrincipal } from "./interfaces";

export abstract class BasePrincipal implements IPrincipal {
    constructor() {

    }

    public get id(): string {
        return "";
    }

    public get name(): string {
        return "";
    }
}
