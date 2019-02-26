import { apiFunctions, apiUrls, constants, errors } from '../config';
import fetchUrl from './fetchUrl';

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
            state.abis[constants.GENERATOR_ABI] = result.body;
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
        if (!generatedMessage.timestamp || !generatedMessage.value || !generatedMessage.data || !generatedMessage.data.v || !generatedMessage.data.r || !generatedMessage.data.s) {
            throw new Error(errors.INVALID_SIGNED_MESSAGE);
        }
    }
}

export default apiUtils;