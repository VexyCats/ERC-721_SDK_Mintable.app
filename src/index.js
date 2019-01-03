import Response, { RESPONSES, RESPONSE_TYPE } from './response';
import { constants, errors } from './config';
import { addressUtils, apiUtils, web3Utils } from './scripts/utils';

const loadWeb3 = async function () {
    this.web3 = new Web3 (this.provider);
    if (this.provider.enable) {
        await this.provider.enable();
    }
}

class MintableCreate {

    constructor (apiKey, provider ) {
        if (!provider) {
            provider = window.ethereum || window.web3;
            if (!provider) {
                throw new Error(errors.INVALID_PROVIDER);
            }
        }
        this.provider = provider;
        this.apiKey = apiKey;
        this.loadClass();
    }

    loaded= false;
    web3 = null;
    AWS = null;
    activeNetwork = null;

    async loadClass () {
        await web3Utils.loadWeb3.bind(this)();
        await apiUtils.loadAWS.bind(this)();
        await apiUtils.validateApiKey(this.AWS, this.apiKey);
        this.loaded = true;
    }

    

    createERC721Mintable (from) {
    }

    create (from=constants.NULL_ADDRESS_HEX, uri=constants.NULL_STRING) {
        if ( !addressUtils.exists(from) ) {
            return new Response(RESPONSE_TYPE[1], errors.INVALID_SENDER );
        }

    }

}

export default MintableCreate;
