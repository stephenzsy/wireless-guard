"use strict";
const fs = require("fs");
var AppContext;
(function (AppContext) {
    const settingsConfigDir = process.env.WG_SETTINGS_CONFIG_DIR;
    const instanceConfigDir = process.env.WG_INSTANCE_CONFIG_DIR;
    function hasConfig() {
        return (settingsConfigDir &&
            instanceConfigDir &&
            fs.statSync(settingsConfigDir).isDirectory() &&
            fs.statSync(instanceConfigDir).isDirectory()) ? true : false;
    }
    AppContext.hasConfig = hasConfig;
    function getSettingsConfigPath() {
        return null;
    }
    function getInstanceConfigPath() {
        return null;
    }
    function getConfig(path) {
        return null;
    }
    AppContext.getConfig = getConfig;
})(AppContext = exports.AppContext || (exports.AppContext = {}));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppContext;
