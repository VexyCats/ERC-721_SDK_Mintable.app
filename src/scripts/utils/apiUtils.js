import { constants } from '../../config';

const apiUtils = {
    loadAWS: function () {
        this.AWS = require('aws-sdk');
        this.AWS.config.update({ region: constants.AWS_REGION });
        this.AWS.config.apiVersions = {
            apigateway: constants.AWS_APIGATEWAY_VERSION,
            cognitoidentityserviceprovider: constants.AWS_COGNITO_VERSION,
        };
    },
    getApiGateway: function (state) {
        return state.ApiGateway ? state.ApiGateway : new state.AWS.APIGateway();
    },
    validateApiKey: async function (state, apiKey) {
    }
}

export default apiUtils;