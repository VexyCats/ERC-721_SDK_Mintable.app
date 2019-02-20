import Web3 from 'web3';
import { addresses, apiFunctions, apiUrls, constants } from '../config';

const web3Utils = {

    loadWeb3 : async function () {
        this.web3 = new Web3 (this.provider);
        if (this.provider.enable) {
            await this.provider.enable();
        }
        this.activeNetwork = await this.web3.eth.net.getId();
        const address = addresses[this.activeNetwork];
        if (address) {
            this.generatorContract = await new this.web3.eth.Contract(this.abis[constants.GENERATOR_ABI], address);
        }
        return true;
    },
    extractTransactionConfig(args) {
        const txConfig = {};
        (args.from) ? txConfig.from = args.from : '';
        (args.gas) ? txConfig.gas = args.gas : '';
        (args.gasPrice) ? txConfig.gasPrice = args.gasPrice : '';
        (args.value) ? txConfig.value = args.value : '';
        return txConfig;
    },
    fetchGeneratedCount: async function (abi={}, address) {
        const generator = await new this.web3.eth.Contract(abi, address);
        return (await generator.methods.viewTotal().call()).valueOf();
    },
    methodTransaction: function (contract, method, { from, gas, gasPrice },  ...args) {
        const txConfig = this.extractTransactionConfig({ from, gas, gasPrice});
        const tx = contract.methods[method](...args).send(txConfig);
        return tx;
    },
    setEventListeners: function (tx, {onData, onChanged, onReceipt, onError}={}) {
        if (onData) {
            tx.on('data', onData);
        }
        if (onChanged) {
            tx.on('change', onChanged);
        }
        if (onReceipt) {
            tx.on('receipt', onReceipt);
        }
        if (onError) {
            tx.on('error', onError);
        }
    }
}

export default web3Utils;