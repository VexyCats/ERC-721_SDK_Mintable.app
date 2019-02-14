const Methods = {
    '': 'GET',
    get: 'GET',
    post: 'POST',
    put: 'PUT'
};

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
      fetchObject.body = body
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