import { apiFunctions, apiUrls, constants, errors } from '../config';
import fetchUrl from './fetchUrl';
import web3Utils from './web3Utils';

const apiUtils = {
    loadAWS: function () {
        this.AWS = require('aws-sdk');
        this.AWS.config.update({ region: constants.AWS_REGION });
        this.AWS.config.apiVersions = {
            apigateway: constants.AWS_APIGATEWAY_VERSION,
            cognitoidentityserviceprovider: constants.AWS_COGNITO_VERSION,
            // other service API versions
        };
    },
    getApiGateway: function (state) {
        return state.ApiGateway ? state.ApiGateway : new state.AWS.APIGateway();
    },
    createLamdaInstance: function (state) {
        return new state.AWS.Lambda();
    },
    generateApiReference: function (name, symbol, from) {
        const time = new Date().getTime();
        from = from.substring(32, 40);
        const uid = `${name}:${symbol}:${from}-${time}`;
        return { uri: `${apiUrls.metadataApi}/${uid}`, apiId: uid };
    },
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
            state.abis[constants.GENERATOR_ABI] = JSON.parse(new Buffer(JSON.parse(result.body)).toString());
        } catch (e) {
            throw new Error(e.message || e);
        }
    },
    generateSignedMessage: async function (state, requestObject) {
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
    confirmCreateTransaction: async function (apiKey, reciept, jwtFetcher) {
        try {
            let url;
            const headers = {};
            const responseObject = reciept;
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
            let result = fetchUrl(url + '/' + reciept.transactionHash + '/complete', 'put',
                headers,
                {
                    responseObject: {
                        status,
                        reciept
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