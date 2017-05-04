import { IPrincipal, IPrincipalManifest, PrincipalType } from "./interfaces";
import { toResourceManifest as baseToResourceManifest } from "../common/resource-manifest";

export function toResourceManifest(principal: IPrincipal): IPrincipalManifest {
    let manifest: IPrincipalManifest = baseToResourceManifest(principal) as IPrincipalManifest;
    switch (principal.type) {
        case PrincipalType.user:
            manifest.type = "user";
            break;
        case PrincipalType.group:
            manifest.type = "group";
            break;
        case PrincipalType.service:
            manifest.type = "service";
            break;
    }
    return manifest;
}
