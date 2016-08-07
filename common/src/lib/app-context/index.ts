import ConfigPath from "../config/config-path";
import * as fs from "fs";

interface WGProcessEnv {
    WG_SETTINGS_CONFIG_DIR: string;
    WG_INSTANCE_CONFIG_DIR: string;
}

export module AppContext {
    const settingsConfigDir: string = (process.env as WGProcessEnv).WG_SETTINGS_CONFIG_DIR;
    const instanceConfigDir: string = (process.env as WGProcessEnv).WG_INSTANCE_CONFIG_DIR;

    export function hasConfig(): boolean {
        return (settingsConfigDir &&
            instanceConfigDir &&
            fs.statSync(settingsConfigDir).isDirectory() &&
            fs.statSync(instanceConfigDir).isDirectory()) ? true : false;
    }

    export function getSettingsConfigPath(): ConfigPath {
        return new ConfigPath(settingsConfigDir);
    }

    export function getInstanceConfigPath(): ConfigPath {
        return new ConfigPath(instanceConfigDir);
    }

    export function getConfig<T>(path: ConfigPath): T {
        return path.loadJsonConfig() as T;
    }
}

export default AppContext;
