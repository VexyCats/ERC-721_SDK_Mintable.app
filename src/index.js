import Response, { RESPONSES, RESPONSE_TYPE } from './response';
import { addresses, batchMints, constants, errors } from './config';
import { addressUtils, apiUtils, web3Utils } from './utils';

let state;

/**
 * Storage for state of the Api and connection to both Web3 and https://mintable.app
 * @protected
 * @property {object[]} abis Array of all Abi objects retrieved after verification
 * @property {string} apiKey Api key used to access the sdk, provided by https://mintable.app
 * @property {string} activeNetwork Present network the sdk is connected to through the provided Web3 provider
 * @property {bool} loaded Whether all components needed to use the Api are fully loaded and the sdk ready to make calls
 * @property {object} provider The Web3 provider used to instantiate the sdk. Same as provided as init if provided, else extracted by the sdk
 * @property {object} web3 Instance of Web3 being usd by the Sdk
 * @property {object} generatorContract Instance of the Generator contract being used by the sdk
 * @property {object} batchGeneratorContract Instance of the batchMint Generator contract being used by the Sdk
 * @property {function=} jwtFetcher Function used to fetch the JWT used to interact with https://mintable.app servers
 */
class State {
    constructor () {
        this.abis = [];
        this.apiKey = null;
        this.activeNetwork = null;
        this.loaded = false;
        this.provider = null;
        this.web3 = null;
        this.generatorContract = null;
        this.batchGeneratorContract = null;
        this.jwtFetcher = null;
        this.assistInstance = null;
    }
};

/**
 * @typedef {string} from New contract creator
 */
/**
 * @typedef {string} name Name of the token to be generated
 */
/**
 * @typedef {string} symbol Symbol of the token to be generated
 */
/**
 * @typedef {string} uri Uri referrence for the first token of the new Token to be generated
 */
/**
 * @typedef {string[] | object[]} metadata An array of string or key-value pair object referring to the details for the initial token to be generated.
 */
/**
 * @typedef {bool} useApi Whether token to be generaed will use https://Mintable.app Api
 */
/**
 * @typedef {object} tansactionDetails
 * Object containing properties required to complete a mintable create transaction
 * @property {from} from New contract creator
 * @property {name} name Name of the token to be generated
 * @property {symbol} symbol Symbol of the token to be generated
 * @property {uri} uri Uri referrence for the first token of the new Token to be generated
 * @property {metadata=} metadata An array of string or key-value pair object referring to the details for the initial token to be generated.
 * @property {useApi=} useApi Whether token to be generaed will use https://Mintable.app Api
 */
/**
 * @typedef {object} tansactionEvents
 * Object containing events to be called upon events emissions from an ethereum transaction.
 * @property {function=} onData Function to be called if the `data` event is triggerred
 * @property {function=} onChanged Function to be called if the `change` event is triggerred
 * @property {function=} onTransactionHash Function to be called if the `transactionHash` event is triggerred
 * @property {function=} onReceipt Function to be called if the `receipt` event is triggerred
 * @property {function=} onConfirmation Function to be called if the `confirmation` event is triggerred
 * @property {function=} onError Function to be called if the `event` event is triggerred
 */

 /**
  * Mintable create class. Handles interfacing between the sdk and external components
  */
class MintableCreate {
    /**
     * @param {string} apiKey 
     * @param {object=} provider 
     * @param {function=} jwtFetcher 
     */
    constructor (apiKey, provider, jwtFetcher) {
        if (!provider) {
            provider = window.ethereum || (window.web3 && window.web3.givenProvider) || (window.web3 && window.web3.currentProvider) ;
            if (!provider) {
                throw new Error(errors.INVALID_PROVIDER);
            }
        }

        if (!apiKey) {
            throw new Error(errors.INVALID_API_KEY);
        }

        state = new State();
        state.provider = provider;
        state.apiKey = apiKey;
        state.jwtFetcher = jwtFetcher;
    }

    /**Get the network Id of the network the Sdk is connected to */
    get activeNetwork () {
        return state.activeNetwork;
    }

    /**Return the Api key used to instantiate the Sdk */
    get apiKey () {
        return state.apiKey;
    }

    /**Returns the Instance of the generator contract been used by the Sdk */
    get deployerContract () {
        return state.generatorContract;
    }

    /**Returns the instance of the Batch mint generator been used by the Sdk */
    get batchDeployerContract () {
        return state.batchGeneratorContract;
    }

    /**Returns the mapping of errors and their explanations */
    get errors () {
        return errors;
    }

    /**Whether the Sdk is loaded and ready */
    get loaded () {
        return state.loaded;
    }

    /**Returns the instance of Web 3 been used by the Sdk */
    get web3 () {
        return state.web3;
    }

    requireLoadedSDK () {
        if (!this.loaded) {
            throw new Error(errors.SDK_NOT_LOADED);
        }
    }

    requireLoadedGenerator () {
        if (!this.deployerContract) {
            throw new Error(errors.SDK_NOT_LOADED);
        }
    }

    requireLoadedBatchMintGenerator () {
        if (!this.batchDeployerContract) {
            throw new Error(errors.SDK_NOT_LOADED);
        }
    }

    requireValidBatchMint (batchMint) {
        if (!batchMints.includes(Number(batchMint)) || Number(batchMint) === 0) {
            throw new Error(errors.INVALID_CONTRACT_BATCHMINT);
        }
    }

    resolveWeb3TxEvent (tx, requestObject, { onTransactionHash, onChanged, onReceipt, onError }) {
        const noEventsSet = !onTransactionHash && !onChanged && !onReceipt && !onError;
        const events = Object.assign( {}, { onTransactionHash, onChanged, onReceipt, onError }, {
            onTransactionHash: hash => {
                apiUtils.logCreateTransaction(state.apiKey ,hash, requestObject, state.jwtFetcher);
                const apiUrl = requestObject.usesApi ? requestObject.uri : undefined;
                onTransactionHash ? onTransactionHash(hash, apiUrl) : null;
            },
            onReceipt: reciept => {
                apiUtils.confirmCreateTransaction(state.apiKey, reciept, state.jwtFetcher);
                onReceipt ? onReceipt(hash) : null;
            }
        });
        if (noEventsSet) {
            return new Promise((resolve) => {
                web3Utils.setEventListeners( tx, {
                    onTransactionHash: events.onTransactionHash,
                    onReceipt: (reciept => {
                        events.onReceipt(reciept);
                        resolve(
                            new Response(RESPONSE_TYPE[0], {
                                message: 'Successfully created Token',
                                reciept: reciept
                            })
                        )
                    }),
                    onError: (error => resolve(
                        new Response(RESPONSE_TYPE[1], new Error(error.message || error))
                    ))
                });
            });
        } else {
            web3Utils.setEventListeners(tx, events);
            return tx;
        }
    }

    async init ({ assistInstance } = {}) {
        try {
            if (state.loaded) {
                return state.loaded;
            }
            if (state.loading) {
                throw new Error(errors.SDK_LOADING);
            }
            state.loading = true;
            state.assistInstance = assistInstance;
            await apiUtils.validateApiKey(state, state.apiKey);
            await web3Utils.loadWeb3.bind(state)();
            state.loaded = true;
            state.loading = false;
            return state.loaded;
        } catch (e) {
            throw new Error(errors[e.message || e] || (e.message || e));
        }
    }

    async fetchTotalCreatedContracts () {
        try {
            this.requireLoadedSDK();
            const abi = state.abis[constants.GENERATOR_ABI];
            const address = addresses[this.activeNetwork];
            return await web3Utils.fetchGeneratedCount.bind(state)(abi, address);
        } catch (e) {
            return new Response(RESPONSE_TYPE[1], e.message || e );
        }
    }

    async priceCreateERC721BatchMintable ({ from=constants.NULL_ADDRESS_HEX, name=constants.NULL_STRING ,symbol= constants.NULL_STRING,uri=constants.NULL_STRING, metadata = [], batchMint = 0, useApi=false }) {
        try {
            this.requireLoadedSDK();
            from = web3Utils.resolveFrom.bind(state)(from);

            if ( !(addressUtils.exists(from) && addressUtils.isValid(state.web3, from)) ) {
                throw new Error(errors.INVALID_SENDER);
            }
            this.requireValidBatchMint(batchMint);

            const usesApi = useApi || metadata && metadata.length > 0 || uri.includes(constants.API_URL);

            const tx = {
                from,
                name,
                symbol,
                uri,
                metadata,
                usesApi,
                batchMint
            }
            const generatedMessage = await apiUtils.generateSignedMessage(state, tx);
            return new Response(RESPONSE_TYPE[0], 
                apiUtils.extractSignedMessagePricing(generatedMessage)
            );
        } catch (e) {
            return new Response(RESPONSE_TYPE[1], e.message || e );
        }
    }

    async priceCreateERC721Metadata ({ from=constants.NULL_ADDRESS_HEX, name=constants.NULL_STRING ,symbol= constants.NULL_STRING,uri=constants.NULL_STRING, metadata = [], useApi=false  }={}) {
        try {
            this.requireLoadedSDK();
            from = web3Utils.resolveFrom.bind(state)(from);
            if ( !addressUtils.exists(from) || !addressUtils.isValid(state.web3, from) ) {
                throw new Error(errors.INVALID_SENDER);
            }
            metadata = metadata.length > 3 ? metadata.slice(0,3) : metadata;
            if (metadata.length < 3) {
                metadata = metadata.concat(Array(3-metadata.length).fill(''));
            }
            const usesApi = false;
            const tx = {
                from,
                name,
                symbol,
                uri,
                metadata,
                usesApi,
                batchMint: 0
            };
            const generatedMessage = await apiUtils.generateSignedMessage(state, tx);
            return new Response(RESPONSE_TYPE[0], 
                apiUtils.extractSignedMessagePricing(generatedMessage)
            );
        } catch (e) {
            return new Response(RESPONSE_TYPE[1], e.message || e );
        }
    }

    async priceCreateERC721 ({ from=constants.NULL_ADDRESS_HEX, name=constants.NULL_STRING ,symbol= constants.NULL_STRING,uri=constants.NULL_STRING, metadata = [], useApi=false }={}, { onTransactionHash, onReceipt, onError } = {}) {
        try {
            this.requireLoadedSDK();
            from = web3Utils.resolveFrom.bind(state)(from);

            if ( !addressUtils.exists(from) || !addressUtils.isValid(state.web3, from) ) {
                throw new Error(errors.INVALID_SENDER);
            }
            const usesApi = useApi || metadata && metadata.length > 0 || uri.includes(constants.API_URL);
            const tx = {
                from,
                name,
                symbol,
                uri,
                metadata,
                usesApi,
                batchMint: 0
            };
            const generatedMessage = await apiUtils.generateSignedMessage(state, tx);
            return new Response(RESPONSE_TYPE[0], 
                apiUtils.extractSignedMessagePricing(generatedMessage)
            );
        } catch (e) {
            return new Response(RESPONSE_TYPE[1], e.message || e );
        }
    }

    async createERC721BatchMintable (contractDetails={},  { onTransactionHash, onReceipt, onError } = {}) {
        try {
            this.requireLoadedSDK() && this.requireLoadedBatchMintGenerator();
            let { from=constants.NULL_ADDRESS_HEX, name=constants.NULL_STRING ,symbol= constants.NULL_STRING,uri=constants.NULL_STRING, metadata = [], batchMint = 0, useApi=false } = contractDetails;
            from = web3Utils.resolveFrom.bind(state)(from);

            if ( !(addressUtils.exists(from) && addressUtils.isValid(state.web3, from)) ) {
                throw new Error(errors.INVALID_SENDER);
            }
            this.requireValidBatchMint(batchMint);

            const usesApi = useApi || metadata && metadata.length > 0 || uri.includes(constants.API_URL);
            let apiRef = {};

            if (useApi) {
                apiRef = apiUtils.generateApiReference();
                uri = apiRef.uri;
            }
            const tx = {
                from,
                name,
                symbol,
                uri,
                metadata,
                usesApi,
                batchMint
            }
            const generatedMessage = await apiUtils.generateSignedMessage(state, tx);
            apiUtils.requireGeneratedSignedMessage(generatedMessage);
            const txPromise = web3Utils.methodTransaction(state.batchGeneratorContract, 'createERC721BatchMint', { from, value: generatedMessage.value }, name, symbol, uri, batchMint, generatedMessage.value, generatedMessage.timestamp, usesApi, generatedMessage.data.signature);
            const requestObject = Object.assign({}, contractDetails, apiRef, { from, url: uri, usesApi, batchMint, isMintableAddress: true, network: state.activeNetwork });
            return this.resolveWeb3TxEvent(txPromise, requestObject, {onTransactionHash, onReceipt, onError });
        } catch (e) {
            return new Response(RESPONSE_TYPE[1], e.message || e );
        }
    }


    /**
     * Create the base type of ERC721 with metadata only in the smart contract. To use metadata, the https://mintable.app Api is required.
     * @param {tansactionDetails} contractDetails Object containing required fields for the contract creation
     * @param {tansactionEvents} events Object containing transaction events: 
     */
    async createERC721Metadata (contractDetails={},  { onTransactionHash, onReceipt, onError } = {}) {
        try {
            this.requireLoadedSDK() && this.requireLoadedGenerator();
            let { from=constants.NULL_ADDRESS_HEX, name=constants.NULL_STRING ,symbol= constants.NULL_STRING,uri=constants.NULL_STRING, metadata = [] } = contractDetails;
            from = web3Utils.resolveFrom.bind(state)(from);

            if ( !addressUtils.exists(from) || !addressUtils.isValid(state.web3, from) ) {
                throw new Error(errors.INVALID_SENDER);
            }
            metadata = metadata.length > 3 ? metadata.slice(0,3) : metadata;
            if (metadata.length < 3) {
                metadata = metadata.concat(Array(3-metadata.length).fill(''));
            }
            metadata = metadata.map(data => String(data));
            //TODO uri.includes(constants.API_URL);
            const usesApi = false;
            const tx = {
                from,
                name,
                symbol,
                uri,
                metadata,
                usesApi,
                batchMint: 0
            }
            const generatedMessage = await apiUtils.generateSignedMessage(state, tx);
            apiUtils.requireGeneratedSignedMessage(generatedMessage);
            const txPromise = web3Utils.methodTransaction(state.generatorContract, 'createERC721Metadata', { from, value: generatedMessage.value }, name, symbol, uri, ...metadata, generatedMessage.value, generatedMessage.timestamp, generatedMessage.data.signature);
            const requestObject = Object.assign({}, contractDetails, { from, url: uri, usesApi, batchMint: 0, isMintableAddress: true, network: state.activeNetwork });
            return this.resolveWeb3TxEvent(txPromise, requestObject, {onTransactionHash, onReceipt, onError });
        } catch (e) {
            return new Response(RESPONSE_TYPE[1], e.message || e );
        }
    }

    /**
     * Create the base type of ERC721 with no metadata in the smart contract. To use metadata, the https://mintable.app Api is required.
     * @param {tansactionDetails} contractDetails Object containing required fields for the contract creation
     * @param {tansactionEvents} events Object containing transaction events: 
     */
    async createERC721 (contractDetails={}, { onTransactionHash, onReceipt, onError } = {}) {
        try {
            this.requireLoadedSDK() && this.requireLoadedGenerator();
            let { from=constants.NULL_ADDRESS_HEX, name=constants.NULL_STRING ,symbol= constants.NULL_STRING,uri=constants.NULL_STRING, useApi=false } = contractDetails;
            from = web3Utils.resolveFrom.bind(state)(from);

            if ( !(addressUtils.exists(from) && addressUtils.isValid(state.web3, from)) ) {
                throw new Error(errors.INVALID_SENDER);
            }

            const metadata = []
            const usesApi = useApi || uri.includes(constants.API_URL);
            let apiRef = {};

            if (useApi) {
                apiRef = apiUtils.generateApiReference();
                uri = apiRef.uri;
            }

            const tx = {
                from,
                name,
                symbol,
                uri,
                metadata,
                usesApi,
                batchMint: 0
            }
            const generatedMessage = await apiUtils.generateSignedMessage(state, tx);
            apiUtils.requireGeneratedSignedMessage(generatedMessage);
            const txPromise = web3Utils.methodTransaction(state.generatorContract, 'createERC721', { from, value: generatedMessage.value }, name, symbol, uri, generatedMessage.value, generatedMessage.timestamp, usesApi, generatedMessage.data.signature);
            const requestObject = Object.assign({}, contractDetails, apiRef, { from, url: uri, usesApi, batchMint: 0, isMintableAddress: true, network: state.activeNetwork });
            return this.resolveWeb3TxEvent(txPromise, requestObject, {onTransactionHash, onReceipt, onError });
        } catch (e) {
            return new Response(RESPONSE_TYPE[1], e.message || e );
        }
    }
}

export default MintableCreate;
