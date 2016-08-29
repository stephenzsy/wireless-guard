import { IManifest } from "./secret-interface";
import Guid from "../common/guid";
import AppContext from "../app-context";
import ConfigPath from "../config/config-path";
import { IUser } from "../users";
import { GeneralErrors } from "../errors";
import { PolicyDefinition } from "../policies";

export module SecretManifiestRepository {
    const secretsDir: string = "secrets";
    const manifestFilename: string = "manifest.json";

    export class ManifestDoesNotExistError extends GeneralErrors.ResourceNotExistError {
        constructor(manifestId: string) {
            super("Manifest " + manifestId + " is not found.");
        }
    }

    function getManifestDirectory(moduleName: string): ConfigPath {
        return AppContext.getInstanceConfigPath(moduleName)
            .path(secretsDir);
    }

    export function initManifest(owner: IUser, moduleName: string): IManifest {
        let id = new Guid();
        let secretDirPath = getManifestDirectory(moduleName)
            .path(id.toString());
        let manifestPath = secretDirPath.path(manifestFilename);
        let manifest: IManifest = {
            id: id.toString(),
            ownerId: owner.id.toString(),
            manifestPath: manifestPath.fsPath,
            secretsDirPath: secretDirPath.fsPath,
            policies: [createAuthorizedForUserPolicy(id, owner)]
        };
        manifestPath.ensureDirExists().saveJsonConfig(manifest);
        return manifest;
    }

    export function loadManifest<T extends IManifest>(id: string, moduleName: string): T {
        let secretDirPath = getManifestDirectory(moduleName)
            .path(id.toString());
        let manifestPath = secretDirPath.path(manifestFilename);

        if (!manifestPath.exists) {
            throw new ManifestDoesNotExistError(id);
        }

        return require(manifestPath.fsPath) as T;
    }

    function createAuthorizedForUserPolicy(manifestId: Guid, user: IUser): PolicyDefinition {
        return {
            id: new Guid().toString(),
            name: "manifest-owner-access-" + manifestId.toString(),
            actions: "*",
            effect: "allow",
            users: ["user:id:" + user.id.toString()]
        };
    }
}

export default SecretManifiestRepository;
