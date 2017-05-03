import { IResource } from "../common/resource";
import {IPrincipal} from "../principals/interfaces";

export interface IMaterial extends IResource {
    readonly owner: IPrincipal;
}
