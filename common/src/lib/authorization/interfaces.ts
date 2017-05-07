import { IPolicy } from "../policies/interfaces";

export interface IAutorizationContext {
    authorized: boolean;
    deinedPolicy?: IPolicy;
}
