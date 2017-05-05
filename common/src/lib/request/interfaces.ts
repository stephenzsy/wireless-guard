import { IPrincipal } from "../principals/interfaces";
import { IPolicy } from "../policies/interfaces";

export interface IRequestAuthenticationContext {
    /**
     * Authenticated principal of the requester
     */
    callerPrincipal: IPrincipal;
}

export interface IRequest {
    readonly id: string;
    readonly timestamp: Date;
    readonly authenticationContext: IRequestAuthenticationContext;
}
