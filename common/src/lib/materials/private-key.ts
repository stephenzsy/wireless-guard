/// <reference path="../types.d.ts"/>

import { WGOpenssl } from "wireless-guard-openssl";

import { Uuid } from "../common/uuid";
import { PrincipalsConfig } from "../config/principals-config";
import { IMaterial, IMaterialManifest, MaterialsAuthorizationAction } from "./interfaces";
import { BaseMaterial } from "./base-material";
import { IResourcePolicy, IResourcePolicyManifest } from "../policies/interfaces";
import { Policy } from "../policies/base-policy";
import { requireServicePrincipalResourePolicy } from "../policies/policies";
import { IRequest } from "../request/interfaces";
import { IPrincipal } from "../principals/interfaces";
import { authorizeRequest } from "../authorization/authorization-helper";
import { IExtendedAppConfig, getAppConfig } from "../config/app-config";

export enum PrivateKeyUsage {
    ca,
    server,
    client
}

export type PrivateKeyUsageManifest = "ca" | "server" | "client";

function toPrivateKeyUsage(manifest: PrivateKeyUsageManifest): PrivateKeyUsage {
    switch (manifest) {
        case "ca":
            return PrivateKeyUsage.ca;
        case "server":
            return PrivateKeyUsage.server;
        case "client":
            return PrivateKeyUsage.client;
    }
}

function toPrivateKeyUsageManifest(usage: PrivateKeyUsage): PrivateKeyUsageManifest {
    switch (usage) {
        case PrivateKeyUsage.ca:
            return "ca";
        case PrivateKeyUsage.server:
            return "server";
        case PrivateKeyUsage.client:
            return "client";
    }
}

interface IAsymmetricPrivateKeyManifest extends IMaterialManifest {
    algorithm: "ec" | "rsa";
    usage: PrivateKeyUsageManifest;
    pemFilePath: string;
}

interface IEcPrivateKeyManifest extends IAsymmetricPrivateKeyManifest {
    curve: "secp384r1";
}

interface IAsymmetricPrivateKey extends IMaterial {
    readonly usage: PrivateKeyUsage;
}

function getPrivateKeyIdentifier(usage: PrivateKeyUsage, id: string) {
    return "private-key:" + toPrivateKeyUsageManifest(usage) + ":" + id;
}

class AsymmetricPrivateKey<T extends IAsymmetricPrivateKeyManifest> extends BaseMaterial<T> implements IAsymmetricPrivateKey {
    private readonly _usage: PrivateKeyUsage;

    constructor(manifest: T) {
        super(manifest);
        this._usage = toPrivateKeyUsage(manifest.usage);
    }

    public get usage(): PrivateKeyUsage {
        return this._usage;
    }

    public get identifier(): string {
        return getPrivateKeyIdentifier(this.usage, this.id);
    }
}

class EcPrivateKey extends AsymmetricPrivateKey<IEcPrivateKeyManifest> {
    constructor(manifest: IEcPrivateKeyManifest) {
        super(manifest);
    }
}

namespace Authorization {

    function authorizeCreatePrivateKeyRequest(request: IRequest, usage: PrivateKeyUsage) {
        let authorizationResult = authorizeRequest<MaterialsAuthorizationAction>(
            request,
            "create",
            getPrivateKeyIdentifier(usage, "*"), [
                requireServicePrincipalResourePolicy
            ]);
        if (!authorizationResult.authorized) {
            throw authorizationResult;
        }
    }

    export async function newEcPrivateKeyManifestAsync(request: IRequest, name: string, usage: PrivateKeyUsage): Promise<IEcPrivateKeyManifest> {
        authorizeCreatePrivateKeyRequest(request, usage);

        let id: string = Uuid.v4();
        let dirPath = getAppConfig().materials.getMaterialConfigPath(id);
        let keyFsPath: string = dirPath
            .ensureDirExists()
            .path("key.pem").fsPath;
        let ownerId: string = request.authenticationContext.principal.id;

        let manifest: IEcPrivateKeyManifest = {
            id: id,
            name: name,
            dateCreated: new Date(),
            owner: ownerId,
            curve: "secp384r1",
            algorithm: "ec",
            usage: toPrivateKeyUsageManifest(usage),
            pemFilePath: keyFsPath,
            policies: [{
                id: Uuid.v4(),
                dateCreated: new Date(),
                effect: "allow",
                actions: "*",
                principals: [
                    { "service-principal": ownerId }
                ],
                name: "allow-owner"
            } as IResourcePolicyManifest]
        }

        // create key.pem
        await WGOpenssl.ecparam({
            out: keyFsPath
        });

        dirPath.path("manifest.json")
            .ensureDirExists()
            .saveJsonConfig(manifest);

        return manifest;
    }
}
