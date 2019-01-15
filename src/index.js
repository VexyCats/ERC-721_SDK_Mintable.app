import Response, { RESPONSES, RESPONSE_TYPE } from './response';
import { constants, errors } from './config';
import { addressUtils, apiUtils, web3Utils } from './utils';

let state;

class State {
    constructor () {
        this.apiKey = null;
        this.AWS = null;
        this.activeNetwork = null;
        this.loaded = false;
        this.provider = null;
        this.web3 = null;
    }
};

class MintableCreate {

    constructor (apiKey, provider ) {
        if (!provider) {
            provider = window.ethereum || (window.web3 && window.web3.givenProvider) || (window.web3 && window.web3.currentProvider) ;
            if (!provider) {
                throw new Error(errors.INVALID_PROVIDER);
            }
        }

        if (!apiKey) {
            throw new Error(errors.INVALID_API);
        }

        state = new State();
        state.provider = provider;
        state.apiKey = apiKey;
    }

    get apiKey () {
        return state.apiKey;
    }

    get activeNetwork () {
        return state.activeNetwork;
    }

    get errors () {
        return errors;
    }

    get loaded () {
        return state.loaded;
    }

    get web3 () {
        return state.web3;
    }

    requireLoadedSDK () {
        if (!this.loaded) {
            throw new Error(errors.SDK_NOT_LOADED);
        }
    }

    async loadSDK () {
        if (state.loaded) {
            return state.loaded;
        }
        if (state.loading) {
            throw new Error(errors.SDK_LOADING);
        }
        state.loading = true;
        await web3Utils.loadWeb3.bind(state)();
        await apiUtils.loadAWS.bind(state)();
        await apiUtils.validateApiKey(state, state.apiKey);
        state.loaded = true;
        return state.loadWeb3;
    }

    createERC721Mintable (from) {
        this.requireLoadedSDK();
    }

    create (from=constants.NULL_ADDRESS_HEX, uri=constants.NULL_STRING) {
        this.requireLoadedSDK();
        if ( !addressUtils.exists(from) ) {
            return new Response(RESPONSE_TYPE[1], errors.INVALID_SENDER );
        }

    }

}

export default MintableCreate;
