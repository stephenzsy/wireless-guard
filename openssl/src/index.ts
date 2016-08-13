import Ecparam from "./ecparam";
import Req from "./req";
import Genrsa from "./genrsa";
import X509 from "./x509";

export module WGOpenssl {
    export const ecparam = Ecparam;
    export const req = Req;
    export const genrsa = Genrsa;
    export const x509 = X509;
}

export default WGOpenssl;
