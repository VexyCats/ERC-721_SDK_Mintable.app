const Methods = {
    '': 'GET',
    get: 'GET',
    post: 'POST',
    put: 'PUT'
};

const fetchUrl = async (url, method='get') => {
    method = Methods(method.toLowerCase());
    return new Promise(async (resolve, reject) => {
        const data = await fetch(url, {
          method: method,
          headers: {
            "content-type": "application/json"
          },
          mode: "cors"
        })
          .then(response => {
            console.log(response);
            return response.json();
          })
          .then(data => {
              console.log(data)
            return data;
          })
          .catch(error => {
              console.error(error)
            return reject(error);
          });
        resolve(data);

    });
  };
  export default fetchUrl;