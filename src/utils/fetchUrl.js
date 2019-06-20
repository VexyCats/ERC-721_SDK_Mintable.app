/**
 * Mapping of methods to the standard value of the corresponding Http method 
 * @protected
 */
const Methods = {
    '': 'GET',
    get: 'GET',
    post: 'POST',
    put: 'PUT'
};

/**
 * Utility to parse and process Http(s) call within the Sdk
 * @exports utils/fetchUrl
 * @param {string} url The uri/url (destination) of the Http call
 * @param {string=} method The type of call
 * @param {object=} headers The headers to be sent with the call 
 * @param {string} body The JSON stringified body of the call
 * @param {bool=} nocors Whether the call should be a cors call
 */
const fetchUrl = async (url, method='get', headers = {}, body = "{}", nocors=false) => {
    method = Methods[method.toLowerCase()];
    Object.assign(headers, {
      'content-type': 'application/json'
    });
    body = typeof body === 'string' ? body : JSON.stringify(body);
    const fetchObject = {
      method,
      headers,
      cache: 'no-cache',
      mode: nocors ? 'no-cors' : 'cors'
    }
    if (method !== 'GET') {
      fetchObject.body = typeof body !== 'string' ? JSON.stringify(body) : body;
    }
    return new Promise(async (resolve, reject) => {
        const data = await fetch(url, fetchObject
        )
          .then(response => {
            return response.json();
          })
          .then(data => {
            if (data.errorMessage || data.error) {
              throw (data.errorMessage || data.error);
            }
            return resolve(data);
          })
          .catch(error => {
            return reject(error);
          });
    });
  };
  export default fetchUrl;