import { apiFunctions, apiUrls, constants } from '../config';

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
        console.log(state)
        const Gateway = this.getApiGateway(state);
        const lambda = this.createLamdaInstance(state);
        console.log(lambda);
        var pullParams = {
            FunctionName : apiFunctions.apiAccess,
            InvocationType : 'RequestResponse',
            LogType : 'None'
        };

        try {
            fetch(apiUrls.apiAccess)
            .then(function(response) {
                console.log(response)
                return response.json();
            })
            .then(function(myJson) {
                console.log(JSON.stringify(myJson));
            });

            // lambda.invoke(pullParams, function(error, data) {
            //     if (error) {
            //         console.log(error);
            //       prompt(error);
            //     } else {
            //         console.log(data);
            //         pullResults = JSON.parse(data.Payload);
            //     }
            //   });
            // const request = Gateway.makeRequest(
            //     'Mintable-sdk',
            //     {
            //         method: 'get'
            //     }
            // );
            // console.log(request);

        } catch (e) {
            console.error(e);
        }
        // fetch('http://example.com/movies.json')
        // .then(function(response) {
        //     return response.json();
        // })
        // .then(function(myJson) {
        //     console.log(JSON.stringify(myJson));
        // });
        state.ApiGateway = Gateway;
        console.log(this)
        throw new Error('No Api');
    }
}

export default apiUtils;