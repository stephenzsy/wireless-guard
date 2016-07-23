import ConfigPath from "../config/config-path";

export module AppContext {
    export function getConfig<T>(path: ConfigPath): T {
        return null as T;
    }
}

export default AppContext;
