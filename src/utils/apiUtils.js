import { apiFunctions, apiUrls, constants } from '../config';
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
        state.ApiGateway = Gateway;
    }
}

export default apiUtils;