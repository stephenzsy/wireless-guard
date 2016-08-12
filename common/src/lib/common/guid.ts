import * as crypto from "crypto";

const yCharTransform = {
    "0": "8",
    "1": "8",
    "2": "8",
    "3": "8",
    "4": "9",
    "5": "9",
    "6": "9",
    "7": "9",
    "8": "a",
    "9": "a",
    "a": "a",
    "b": "a",
    "c": "b",
    "d": "b",
    "e": "b",
    "f": "b"
};

const guidRegExp: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export class Guid {
    private guidStr: string;

    constructor(guidStr?: string) {
        if (!guidStr) {
            this.guidStr = Guid.generateGuidString();
        } else if (Guid.validateGuid(guidStr)) {
            this.guidStr = guidStr;
        } else {
            throw "Invalid Guid: " + guidStr;
        }
    }

    /**
     * @override
     */
    public toString(): string {
        return this.guidStr;
    }

    private static validateGuid(guidString: string): boolean {
        if (guidString.length !== 36) {
            return false;
        }
        return guidRegExp.test(guidString);
    }

    private static generateGuidString(): string {
        let str: string = (crypto.randomBytes(32) as Buffer).toString("hex");
        return str.substr(0, 8)
            + "-" + str.substr(8, 4)
            + "-4" + str.substr(13, 3)
            + "-" + yCharTransform[str.charAt(16)] + str.substr(17, 3)
            + "-" + str.substr(20, 12);
    }

    public static convertToHexString(guid: Guid): string {
        let str = guid.toString().replace(/-/g, "");
        console.log(str);
        return str;
    }
}

export default Guid;
