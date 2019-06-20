const nanoid = require('nanoid');
import { apiFunctions, apiUrls, constants, errors } from '../config';
import fetchUrl from './fetchUrl';
import web3Utils from './web3Utils';

/**
 * Utility to parse and process Api calls to https://mintable.app servers
 * @exports utils/apiUtils
 */
const apiUtils = {
    /**Generate an uuid to refeerence the new contract about to be deployed to the network,
     * since there is no address till the transaction is mined. 
     * @returns {object} A uuid object containing both the uuid (apiId), and the generated uri (uri)
     */
    generateApiReference: function () {
        const uid = nanoid()
        return { uri: `${uid}/0`, apiId: uid };
    },
    /**Retrieve current Jwt using the provided function,
     * required to make authenticated call to the https://mintable.app server,
     * @returns {string} The retrieved jwt (JSON Web Token)
     */
    fetchJwt: async function (fn) {
        if (!fn) {
            return;
        }
        let jwt = fn();
        if (jwt.then || jwt.status) {
            jwt = await jwt;
        }
        return jwt;
    },
    /**Connect to the https://mintable.app server,
     * to Validate the provided ApiKey used to instantiate the Sdk,
     * and if valid, store the returned abi(s).
     * Required to use the Sdk.
     * @param {object} state The State Object of the Sdk instance
     * @param {string} apiKey The Api key used to instantiate the Sdk
     */
    validateApiKey: async function (state, apiKey) {
        try {
            let result = fetchUrl(apiUrls.apiAccess, 'get', {
                authorizationToken: apiKey
            });
            result = await result;
            const error = result.error || result.errorMessage || (result.body && JSON.parse(result.body).error) || (result.body && JSON.parse(result.body).errorMessage);
            if (error) {
                throw error;
            }
            let body = result.body || result;
            body = typeof body === 'string' ? JSON.parse(body) : body;
            state.abis[constants.GENERATOR_ABI] = JSON.parse(new Buffer(body).toString());
        } catch (e) {
            throw new Error(e.message || e);
        }
    },
    /**Connect to the https://mintable.app server,
     * to generate the Oracle's signed message,
     * which will be sent to the smart contract, and used to validate Access to the smart contracts
     * @param {object} state The State Object of the Sdk instance
     * @param {tansactionDetails} requestObject The extracted object with the tansactions details
     */
    generateSignedMessage: async function (state, requestObject) {
        requestObject.network = state.activeNetwork;
        try {
            let result = fetchUrl(apiUrls.generateCall, 'post', {
                    authorizationToken: state.apiKey
                },
                requestObject
            );
            result = await result;
            return result;
        } catch (e) {
            throw new Error(e.message || e);
        }
    },
    requireGeneratedSignedMessage: function (generatedMessage) {
        if (generatedMessage.status === 'error' || !generatedMessage.timestamp || !generatedMessage.value || !generatedMessage.data || !generatedMessage.data.v || !generatedMessage.data.r || !generatedMessage.data.s) {
            throw new Error(errors.INVALID_SIGNED_MESSAGE);
        }
    },
    extractSignedMessagePricing: function (generatedMessage) {
        this.requireGeneratedSignedMessage(generatedMessage);
        return {
            value: web3Utils.parseEtherValue(generatedMessage.value, true),
            usdValue: generatedMessage.usdValue
        };
    },
    logCreateTransaction: async function (apiKey, hash, requestObject, jwtFetcher) {
        try {
            let url;
            const headers = {};

            if (jwtFetcher) {
                headers.Authorization = await this.fetchJwt(jwtFetcher);
                url = apiUrls.authLogTransaction;
            } else {
                headers.authorizationToken = apiKey;
                url = apiUrls.logTransaction;
            }

            let result = fetchUrl(url + '/' + hash, 'put',
                headers,
                {
                    transactionType: 'create',
                    requestObject
                }
            );
            result = await result;
            return result;
        } catch (e) {
            throw new Error(e.message || e);
        }
    },
    confirmCreateTransaction: async function (apiKey, receipt, jwtFetcher) {
        try {
            let url;
            const headers = {};
            const responseObject = receipt;
            let status;
            if (typeof responseObject.status !== 'undefined') {
                status =  responseObject.status ? 'success' : 'error';
            } else {
                status =  'success';
            }

            if (jwtFetcher) {
                headers.Authorization = await this.fetchJwt(jwtFetcher);
                url = apiUrls.authConfirmCreateTransaction;
            } else {
                headers.authorizationToken = apiKey;
                url = apiUrls.confirmCreateTransaction;
            }
            let result = fetchUrl(url + '/' + receipt.transactionHash + '/complete', 'put',
                headers,
                {
                    responseObject: {
                        status,
                        receipt
                    }
                }
            );
            result = await result;
            return result;
        } catch (e) {
            throw new Error(e.message || e);
        }
    }
}

export default apiUtils;