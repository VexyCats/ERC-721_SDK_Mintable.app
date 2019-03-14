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
    logCreateTransaction: async function (hash, requestObject, jwtFetcher) {
        try {
            let url = apiUrls.logTransaction;

            const headers = {
                authorizationToken: state.apiKey
            }
            if (jwtFetcher) {
                let jwt = jwtFetcher();
                jwt = jwt.then ? await jwt : jwt;
                headers.Authorization = jwt;
                url = apiUrls.authLogTransaction;
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
    confirmCreateTransaction: async function (reciept, responseObject, jwtFetcher) {
        try {
            let url = apiUrls.confirmCreateTransaction;

            const headers = {
                authorizationToken: state.apiKey
            }
            if (jwtFetcher) {
                let jwt = jwtFetcher();
                jwt = jwt.then ? await jwt : jwt;
                headers.Authorization = jwt;
                url = apiUrls.authConfirmCreateTransaction;
            }
            let result = fetchUrl(url + '/' + reciept.transactionHash + '/complete', 'put',
                headers,
                {
                    responseObject
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