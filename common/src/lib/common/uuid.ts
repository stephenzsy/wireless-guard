import * as crypto from "crypto";

export module Uuid {
    export function v4(): string {
        return generateUuidString();
    }

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

    function isUuid(uuidString: string): boolean {
        if (uuidString.length !== 36) {
            return false;
        }
        return uuidRegExp.test(uuidString);
    }

    function generateUuidString(): string {
        let str: string = (crypto.randomBytes(32) as Buffer).toString("hex");
        return str.substr(0, 8)
            + "-" + str.substr(8, 4)
            + "-4" + str.substr(13, 3)
            + "-" + yCharTransform[str.charAt(16)] + str.substr(17, 3)
            + "-" + str.substr(20, 12);
    }

    export function convertToHexString(uuid: string): string {
        return uuid.toString().replace(/-/g, "");
    }
}

export default Uuid;
