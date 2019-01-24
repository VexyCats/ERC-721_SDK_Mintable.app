import Web3 from 'web3';

const web3Utils = {

    loadWeb3 : async function () {
        this.web3 = new Web3 (this.provider);
        if (this.provider.enable) {
            await this.provider.enable();
        }
        this.activeNetwork = await this.web3.eth.net.getId();
        return true;
    },
    fetchGeneratedCount: async function (abi={}, address) {
        const generator = await new this.web3.eth.Contract(abi, address);
        return (await generator.methods.viewTotal().call()).valueOf();
    }
}

export default web3Utils;