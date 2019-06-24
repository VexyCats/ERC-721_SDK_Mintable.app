/**
 * @typedef RESPONSE_TYPE
 * @type {string}
 */
/**
 * @typedef RESPONSE_TYPES
 * @type {RESPONSE_TYPE[]}
 */

const RESPONSES = [
    'success',
    'error'
];

const RESPONSE_TYPE = {
    0: RESPONSES[0],
    1: RESPONSES[1],
};

/**
 * Create response object type as return value for sdk function call
 * @exports callResponse
 * @param {RESPONSE_TYPE} type The type of response 
 * @param {*} content The value of the response, to be returned
 * @returns {object} The Response object containing status, error or result
 */
const callResponse = function (type, content) {
    if (!RESPONSES.includes(type)) {
        if (!RESPONSE_TYPE[type]) {
            throw new Error('Invalid response type');
        } else {
            type = RESPONSE_TYPE[type];
        }
    } 

    const response = {
        status: RESPONSES[0]
    };
    switch (type) {
        case RESPONSES[1]:
            response.status = RESPONSES[1];
            response.error = content;
            break;
        default:
            response.result = content;
            break;
    }
    return response;
}

export default callResponse;
export { RESPONSES, RESPONSE_TYPE };