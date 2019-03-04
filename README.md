# mintable-create-sdk  
Use the SDK to create anything as a ERC-721 easily. No smart contracts needed.

## Setup
`npm install --save mintable-create-sdk`
  
    
```
import MintableCreate from 'mintable-create-sdk';
...
const mintable = new MintableCreate();
await mintable.init();

console.log(mintable.loaded);

//true

mintable.create({MyERC721Details})
//returns a web3 call that the user can approve and send
```
