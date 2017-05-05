/// <reference path="../types.d.ts" />

import { IPrincipal } from "./interfaces";

export class PrincipalsStore {
    private dataStore: StringMap<IPrincipal> = {};

    public add(principal: IPrincipal) {
        this.dataStore[principal.id] = principal;
    }

    public resolve(principalId: string): IPrincipal | undefined {
        return this.dataStore[principalId];
    }
}