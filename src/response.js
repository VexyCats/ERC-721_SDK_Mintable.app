const RESPONSES = [
    'success',
    'error'
]

const RESPONSE_TYPE = {
    0: RESPONSES[0],
    1: RESPONSES[1],
}

const callResponse = function (type, content) {
    if (!RESPONSES.includes(type)) {
        if (!RESPONSE_TYPE[type]) {
            throw new Error('Invalid response type');
        } else {
            type = RESPONSE_TYPE[type];
        }
    } 

    const response = {
        status: 200
    };
    switch (type) {
        case RESPONSES[1]:
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