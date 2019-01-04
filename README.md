# mintable-create-sdk  
Use the SDK to create anything as a ERC-721 easily. No smart contracts needed.

## Setup
`npm install --save mintable-create-sdk`
  
    
```
import MintableCreate from 'mintable-create-sdk';
...
const mintable = new MintableCreate();
await mintable.loadSDK();
  

console.log(mintable.loaded);

//true
```