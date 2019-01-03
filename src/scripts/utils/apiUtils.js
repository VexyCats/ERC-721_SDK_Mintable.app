import { constants } from '../../config';

const apiUtils = {
    loadAWS: function () {
        this.AWS = require('aws-sdk');
        this.AWS.config.update({ region: constants.AWS_REGION });
    },
    validateApiKey: function (aws, apiKey) {

    }
}

export default apiUtils;