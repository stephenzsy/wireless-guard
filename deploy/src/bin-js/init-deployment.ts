import * as process from "process";
import * as crypto from "crypto";

import {
    IDeployment,
    ConfigPath,
    Uuid,
    Config,
    Principals
} from "wireless-guard-common";

import {
    BaseCommand
} from "./base-command";

interface IOpts {
    dir: string;
}

type WellKnownServiceIdentifier = "deploy";

class Command extends BaseCommand<IOpts> {

    /**
     * @override
     * @param args
     */
    protected parseArgs(args: string[]): IOpts {
        let result: IOpts = {} as IOpts;
        while (args.length > 0) {
            let opt = args.shift();
            switch (opt) {
                case "--dir":
                    let dir = args.shift();
                    if (dir !== undefined) {
                        result.dir = dir;
                    }
                    break;
            }
        }
        if (!result.dir) {
            throw "parameter --dir not provided";
        }
        return result;
    }

    public exec(): void {
        console.log("=== Welcome to Wireless Guard ===");
        console.log("=== Initialize Deployment ===");

        // create dir
        let configPath = new ConfigPath(this.options.dir);

        let deploymentConfigPath = configPath
            .path("deployment-config.json")
            .ensureDirExists();

        let deployment: IDeployment;

        if (deploymentConfigPath.exists) {
            deployment = deploymentConfigPath.loadJsonConfig<IDeployment>();

            console.log("Loaded deployment: " + deployment.id);
        } else {
            // create id
            deployment = {
                id: Uuid.v4(),
                createdAt: new Date()
            }

            deploymentConfigPath
                .saveJsonConfig(deployment);

            console.log("Created deployment: " + deployment.id);
        }

        // initialize service principal
        let appConfig = Config.initExtendedAppConfig(configPath);
        let servicePrincipal = appConfig.principals.getWellKnownServicePrincipal<WellKnownServiceIdentifier>("deploy", true);
        if (servicePrincipal) {
            console.log("Loaded service principal: " + servicePrincipal.id);
        } else {
            servicePrincipal = appConfig.principals.contributeServicePrincipal<WellKnownServiceIdentifier>(
                "deploy",
                Principals.newServicePrincipalManifest("deploy"));
            console.log("Created service principal: " + servicePrincipal.id);
        }
    }
}

export function exec() {
    let argv = process.argv;
    argv.shift();
    argv.shift();
    new Command(argv).exec();
}
