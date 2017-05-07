import { IPrincipal } from "../principals/interfaces";

export interface IRequestAuthenticationContext {
    /**
     * Authenticated principal of the requester
     */
    principal; IPrincipal;
    /**
     * Authenticated principal of the original requester
     */
    callerPrincipal: IPrincipal;
}

export interface IRequest {
    readonly id: string;
    readonly timestamp: Date;
    readonly authenticationContext: IRequestAuthenticationContext;
}
