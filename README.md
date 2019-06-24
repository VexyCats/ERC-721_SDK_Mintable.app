# mintable-create-sdk  
Use the SDK to create anything as a ERC-721 easily. No smart contracts needed.

## Setup
`npm install --save mintable-create-sdk`
  
    
```
import MintableCreate from 'mintable-create-sdk';

...

const mintable = new MintableCreate();

//apiKey: Key provided by https://mintable.app
//provider: (optional) Preferred web3 provider
//jwtFetcher: (optional) Function which returns a JWT to access http://mintable.app servers when called

await mintable.init(apiKey, ?provider, ?jwtFetcher);

console.log(mintable.loaded);

//true

mintable.create({MyERC721Details})
//returns a web3 call that the user can approve and send
```
