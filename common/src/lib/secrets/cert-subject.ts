export interface CertSubjectConfig {
    country: string;
    stateOrProviceName: string;
    localityName: string;
    organizationName: string;
    organizationUnitName: string;
    commonName: string;
    emailAddress: string;
}

export class CertSubject {
    country: string;
    stateOrProviceName: string;
    localityName: string;
    organizationName: string;
    organizationUnitName: string;
    commonName: string;
    emailAddress: string;

    constructor(config: CertSubjectConfig, override: CertSubjectConfig = config) {
        this.country = config.country;
        this.stateOrProviceName = config.stateOrProviceName;
        this.localityName = config.localityName;
        this.organizationName = config.organizationName;
        this.organizationUnitName = config.organizationUnitName;
        this.commonName = override.commonName;
        this.emailAddress = override.emailAddress;
    }

    get subject(): string {
        var subj: string = '';
        if (this.country) {
            subj += '/C=' + this.country.trim();
        }
        if (this.stateOrProviceName) {
            subj += '/ST=' + this.stateOrProviceName.trim()
        }
        if (this.localityName) {
            subj += '/L=' + this.localityName.trim();
        }
        if (this.organizationName) {
            subj += '/O=' + this.organizationName.trim();
        }
        if (this.organizationUnitName) {
            subj += '/OU=' + this.organizationUnitName.trim();
        }
        if (this.commonName) {
            subj += '/CN=' + this.commonName.trim();
        }
        if (this.emailAddress) {
            subj += '/emailAddress=' + this.emailAddress.trim();
        }
        return subj;
    }
}
