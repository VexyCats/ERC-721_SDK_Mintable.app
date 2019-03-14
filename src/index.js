import Response, { RESPONSES, RESPONSE_TYPE } from './response';
import { addresses, batchMints, constants, errors } from './config';
import { addressUtils, apiUtils, web3Utils } from './utils';

let state;

class State {
    constructor () {
        this.abis = [];
        this.apiKey = null;
        this.AWS = null;
        this.activeNetwork = null;
        this.loaded = false;
        this.provider = null;
        this.web3 = null;
        this.generatorContract = null;
        this.jwtFetcher = null;
    }
};

class MintableCreate {

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

    get activeNetwork () {
        return state.activeNetwork;
    }

    get apiKey () {
        return state.apiKey;
    }

    get deployerContract () {
        return state.generatorContract;
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

    requireLoadedGenerator () {
        if (!this.generatorContract) {
            throw new Error(errors.SDK_NOT_LOADED);
        }
    }

    requireValidBatchMint (batchMint) {
        if (!batchMints.includes(String(batchMint)) || Number(batchMint) === 0) {
            throw new Error(errors.SDK_NOT_LOADED);
        }
    }

    resolveWeb3TxEvent (tx, requestObject, { onTransactionHash, onChanged, onReceipt, onError }) {
        const noEventsSet = !onTransactionHash && !onChanged && !onReceipt && !onError;
        const events = Object.assign( {}, { onTransactionHash, onChanged, onReceipt, onError }, {
            onTransactionHash: hash => {
                apiUtils.logCreateTransaction(state.apiKey ,hash, requestObject, state.jwtFetcher);
                onTransactionHash ? onTransactionHash(hash) : null;
            },
            onReceipt: reciept => {
                apiUtils.confirmCreateTransaction(state.apiKey, reciept, requestObject, state.jwtFetcher);
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

    async init () {
        try {
            if (state.loaded) {
                return state.loaded;
            }
            if (state.loading) {
                throw new Error(errors.SDK_LOADING);
            }
            state.loading = true;
            await apiUtils.loadAWS.bind(state)();
            await apiUtils.validateApiKey(state, state.apiKey);
            await web3Utils.loadWeb3.bind(state)();
            state.loaded = true;
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

    async priceCreateERC721MetadataBatchMintable ({ from=constants.NULL_ADDRESS_HEX, name=constants.NULL_STRING ,symbol= constants.NULL_STRING,uri=constants.NULL_STRING, metadata = [], useApi=false, batchMint=0  }={}, { onTransactionHash, onReceipt, onError } = {}) {
        // try {
        //     batchMint = Number(batchMint);
        //     this.requireLoadedSDK() && this.requireLoadedGenerator() && this.requireValidBatchMint(batchMint);
        //     from = web3Utils.resolveFrom.bind(state)(from);
        //     if ( !addressUtils.exists(from) || !addressUtils.isValid(state.web3, from) ) {
        //         throw new Error(errors.INVALID_SENDER);
        //     }
        //     const usesApi = useApi || (metadata && metadata.length > 0) || uri.includes(constants.API_URL);
        //     const tx = {
        //         from,
        //         name,
        //         symbol,
        //         uri,
        //         metadata,
        //         usesApi,
        //         batchMint
        //     }
        //     const generatedMessage = await apiUtils.generateSignedMessage(state, tx);
        //     return new Response(RESPONSE_TYPE[0], 
        //         apiUtils.extractSignedMessagePricing(generatedMessage)
        //     );
        // } catch (e) {
        //     return new Response(RESPONSE_TYPE[1], e.message || e );
        // }
    }

    async priceCreateERC721BatchMintable ({ from=constants.NULL_ADDRESS_HEX, name=constants.NULL_STRING ,symbol= constants.NULL_STRING,uri=constants.NULL_STRING, metadata = [], useApi=false, batchMint=0  }={}, { onTransactionHash, onReceipt, onError } = {}) {
        // try {
        //     batchMint = Number(batchMint);
        //     this.requireLoadedSDK() && this.requireLoadedGenerator() && this.requireValidBatchMint(batchMint);
        //     from = web3Utils.resolveFrom.bind(state)(from);
        //     if ( !addressUtils.exists(from) || !addressUtils.isValid(state.web3, from) ) {
        //         throw new Error(errors.INVALID_SENDER);
        //     }
        //     const usesApi = useApi || (metadata && metadata.length > 0) || uri.includes(constants.API_URL);
        //     const tx = {
        //         from,
        //         name,
        //         symbol,
        //         uri,
        //         metadata,
        //         usesApi,
        //         batchMint
        //     }
        //     const generatedMessage = await apiUtils.generateSignedMessage(state, tx);
        //     return new Response(RESPONSE_TYPE[0], 
        //         apiUtils.extractSignedMessagePricing(generatedMessage)
        //     );
        // } catch (e) {
        //     return new Response(RESPONSE_TYPE[1], e.message || e );
        // }
    }

    async priceCreateERC721Metadata ({ from=constants.NULL_ADDRESS_HEX, name=constants.NULL_STRING ,symbol= constants.NULL_STRING,uri=constants.NULL_STRING, metadata = [], useApi=false  }={}) {
        try {
            this.requireLoadedSDK() && this.requireLoadedGenerator();
            from = web3Utils.resolveFrom.bind(state)(from);
            if ( !addressUtils.exists(from) || !addressUtils.isValid(state.web3, from) ) {
                throw new Error(errors.INVALID_SENDER);
            }
            metadata = metadata.length > 3 ? metadata.slice(0,3) : metadata;
            if (metadata.length < 3) {
                metadata = metadata.concat(Array(3-metadata.length).fill(''));
            }
            const usesApi = useApi || (metadata && metadata.length > 0) || uri.includes(constants.API_URL);
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
            }
            const generatedMessage = await apiUtils.generateSignedMessage(state, tx);
            return new Response(RESPONSE_TYPE[0], 
                apiUtils.extractSignedMessagePricing(generatedMessage)
            );
        } catch (e) {
            return new Response(RESPONSE_TYPE[1], e.message || e );
        }
    }

    async createERC721MetadataBatchMintable ({ from=constants.NULL_ADDRESS_HEX, name=constants.NULL_STRING ,symbol= constants.NULL_STRING,uri=constants.NULL_STRING, useApi=false  }={}) {
        // try {
        //     batchMint = Number(batchMint);
        //     this.requireLoadedSDK() && this.requireLoadedGenerator() && this.requireValidBatchMint(batchMint);
        //     from = web3Utils.resolveFrom.bind(state)(from);
        //     if ( !addressUtils.exists(from) || !addressUtils.isValid(state.web3, from) ) {
        //         throw new Error(errors.INVALID_SENDER);
        //     }
        //     metadata = metadata.length > 3 ? metadata.slice(0,3) : metadata;
        //     if (metadata.length < 3) {
        //         metadata = metadata.concat(Array(3-metadata.length).fill(''));
        //     }
        //     const usesApi = useApi || (metadata && metadata.length > 0) || uri.includes(constants.API_URL);
        //     const tx = {
        //         from,
        //         name,
        //         symbol,
        //         uri,
        //         metadata,
        //         usesApi,
        //         batchMint: 0
        //     }
        //     metadata = metadata.map(data => String(data));
        //     const generatedMessage = await apiUtils.generateSignedMessage(state, tx);
        //     apiUtils.requireGeneratedSignedMessage(generatedMessage);
        //     const txPromise = web3Utils.methodTransaction(state.generatorContract, 'createERC721Metadata', { from, value: generatedMessage.value }, name, symbol, uri, ...metadata);
            // const requestObject = { from, name, symbol, url: uri, metadata, batchMint };
        //     return this.resolveWeb3TxEvent(txPromise, requestObject, {onTransactionHash, onReceipt, onError });
        // } catch (e) {
        //     return new Response(RESPONSE_TYPE[1], e.message || e );
        // }
    }

    async createERC721BatchMintable ({ from=constants.NULL_ADDRESS_HEX, name=constants.NULL_STRING ,symbol= constants.NULL_STRING,uri=constants.NULL_STRING, metadata = [], useApi=false, batchMint=0  }={}, { onTransactionHash, onReceipt, onError } = {}) {
        // try {
        //     batchMint = Number(batchMint);
        //     this.requireLoadedSDK() && this.requireLoadedGenerator() && this.requireValidBatchMint(batchMint);
        //     from = web3Utils.resolveFrom.bind(state)(from);
        //     if ( !addressUtils.exists(from) || !addressUtils.isValid(state.web3, from) ) {
        //         throw new Error(errors.INVALID_SENDER);
        //     }
        //     const usesApi = useApi || (metadata && metadata.length > 0) || uri.includes(constants.API_URL);
        //     const tx = {
        //         from,
        //         name,
        //         symbol,
        //         uri,
        //         metadata,
        //         usesApi,
        //         batchMint
        //     }
        //     metadata = metadata.map(data => String(data));
        //     const generatedMessage = await apiUtils.generateSignedMessage(state, tx);
        //     apiUtils.requireGeneratedSignedMessage(generatedMessage);
        //     const txPromise = web3Utils.methodTransaction(state.generatorContract, 'createERC721Metadata', { from, value: generatedMessage.value }, name, symbol, uri);
            // const requestObject = { from, name, symbol, url: uri, metadata, batchMint };
        //     return this.resolveWeb3TxEvent(txPromise, requestObject, {onTransactionHash, onReceipt, onError });
        // } catch (e) {
        //     return new Response(RESPONSE_TYPE[1], e.message || e );
        // }
    }

    async createERC721Metadata ({ from=constants.NULL_ADDRESS_HEX, name=constants.NULL_STRING ,symbol= constants.NULL_STRING,uri=constants.NULL_STRING, metadata = [] }={},  { onTransactionHash, onReceipt, onError } = {}) {
        try {
            this.requireLoadedSDK() && this.requireLoadedGenerator();
            from = web3Utils.resolveFrom.bind(state)(from);
            if ( !addressUtils.exists(from) || !addressUtils.isValid(state.web3, from) ) {
                throw new Error(errors.INVALID_SENDER);
            }
            metadata = metadata.length > 3 ? metadata.slice(0,3) : metadata;
            if (metadata.length < 3) {
                metadata = metadata.concat(Array(3-metadata.length).fill(''));
            }
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
            metadata = metadata.map(data => String(data));
            const generatedMessage = await apiUtils.generateSignedMessage(state, tx);
            apiUtils.requireGeneratedSignedMessage(generatedMessage);
            const txPromise = web3Utils.methodTransaction(state.generatorContract, 'createERC721Metadata', { from }, name, symbol, uri, ...metadata);
            const requestObject = { from, name, symbol, url: uri, metadata, batchMint: 0 };
            return this.resolveWeb3TxEvent(txPromise, requestObject, {onTransactionHash, onReceipt, onError });
        } catch (e) {
            return new Response(RESPONSE_TYPE[1], e.message || e );
        }
    }

    async createERC721 ({ from=constants.NULL_ADDRESS_HEX, name=constants.NULL_STRING ,symbol= constants.NULL_STRING,uri=constants.NULL_STRING, metadata = [], useApi=false }={}, { onTransactionHash, onReceipt, onError } = {}) {
        try {
            this.requireLoadedSDK() && this.requireLoadedGenerator();
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
            }
            const generatedMessage = await apiUtils.generateSignedMessage(state, tx);
            apiUtils.requireGeneratedSignedMessage(generatedMessage);
            const txPromise = web3Utils.methodTransaction(state.generatorContract, 'createERC721', { from }, name, symbol, uri);
            const requestObject = { from, name, symbol, url: uri, metadata, batchMint: 0 };
            return this.resolveWeb3TxEvent(txPromise, requestObject, {onTransactionHash, onReceipt, onError });
        } catch (e) {
            return new Response(RESPONSE_TYPE[1], e.message || e );
        }
    }

    async create ({ from=constants.NULL_ADDRESS_HEX, name=constants.NULL_STRING ,symbol= constants.NULL_STRING,uri=constants.NULL_STRING, metadata=[], useApi=false  }={}) {
        const usesApi = useApi || metadata.length > 3;

    }
}

export default MintableCreate;
