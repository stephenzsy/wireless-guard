declare module LoopBack {
    interface ModelStatic {
        disableRemoteMethod(name: string, isStatic: boolean): void;
    }
    interface PersistedModel {
    }
    namespace PersistedModelStatic {
        type FindCallback<T extends PersistedModel> = (err: any, returnedInstances: T[]) => void;
        interface FindFilter {

        }
    }
    interface PersistedModelStatic extends ModelStatic {
        find(filter: PersistedModelStatic.FindFilter, FindCallback): void;
    }
}
