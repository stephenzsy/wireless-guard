import Guid from "../common/guid";
import {PolicyDefinition} from "../policies";
export interface ISecret {
    id: Guid;
}

export interface IManifest {
    id: string;
    ownerId: string;
    /**
     * Manifest absolute path
     */
    manifestPath: string;
    secretsDirPath: string;
    policies: PolicyDefinition[];
}
