import Web3 from 'web3';

const web3Utils = {

    loadWeb3 : async function () {
        this.web3 = new Web3 (this.provider);
        if (this.provider.enable) {
            await this.provider.enable();
        }
        this.activeNetwork = await this.web3.eth.net.getId()
        return true;
    }
}

export default web3Utils;