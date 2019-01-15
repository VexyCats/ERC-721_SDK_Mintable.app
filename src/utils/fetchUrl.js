const Methods = {
    '': 'GET',
    get: 'GET',
    post: 'POST',
    put: 'PUT'
};

const fetchUrl = async (url, method='get', headers = {}, nocors=false) => {
    method = Methods[method.toLowerCase()];
    Object.assign(headers, {
      'content-type': 'application/json'
    });
    return new Promise(async (resolve, reject) => {
        const data = await fetch(url, {
          method,
          headers,
          cache: 'no-cache',
          mode: nocors ? 'no-cors' : 'cors'
        })
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