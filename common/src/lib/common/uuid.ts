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

const uuidRegExp: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export class Uuid {
    private uuidStr: string;

    constructor(uuidStr?: string) {
        if (!uuidStr) {
            this.uuidStr = Uuid.generateUuidString();
        } else if (Uuid.validateUuid(uuidStr)) {
            this.uuidStr = uuidStr;
        } else {
            throw "Invalid Guid: " + uuidStr;
        }
    }

    /**
     * @override
     */
    public toString(): string {
        return this.uuidStr;
    }

    public equals(other: Uuid): boolean {
        return this.uuidStr === other.uuidStr;
    }

    private static validateUuid(uuidString: string): boolean {
        if (uuidString.length !== 36) {
            return false;
        }
        return uuidRegExp.test(uuidString);
    }

    private static generateUuidString(): string {
        let str: string = (crypto.randomBytes(32) as Buffer).toString("hex");
        return str.substr(0, 8)
            + "-" + str.substr(8, 4)
            + "-4" + str.substr(13, 3)
            + "-" + yCharTransform[str.charAt(16)] + str.substr(17, 3)
            + "-" + str.substr(20, 12);
    }

    public static convertToHexString(uuid: Uuid): string {
        return uuid.toString().replace(/-/g, "");
    }
}

export default Uuid;
