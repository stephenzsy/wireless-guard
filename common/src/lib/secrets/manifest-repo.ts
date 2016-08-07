import { IManifest } from "./manifest";
import Guid from "../common/guid";
import AppContext from "../app-context";
import ConfigPath from "../config/config-path";
import { IUser } from "../users/user";

export module SecretManifiestRepository {
    const secretsDir: string = "secrets";
    const manifestFilename: string = "manifest.json";

    export function initManifest(owner: IUser): IManifest {
        let id = new Guid();
        let secretDirPath = AppContext.getInstanceConfigPath()
            .path(secretsDir)
            .path(id.toString());
        let manifestPath = secretDirPath.path(manifestFilename);
        let manifest: IManifest = {
            id: id.toString(),
            ownerId: owner.id.toString(),
            manifestPath: manifestPath.fsPath,
            secretsDirPath: secretDirPath.fsPath
        };
        manifestPath.ensureDirExists().saveJsonConfig(manifest);
        return manifest;
    }
}

export default SecretManifiestRepository;
