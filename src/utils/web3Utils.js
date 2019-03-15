import Web3 from 'web3';
import { addresses, apiFunctions, apiUrls, constants } from '../config';
import { addressUtils } from './';

const web3Utils = {

    loadWeb3 : async function () {
        this.web3 = new Web3 (this.provider);
        if (this.provider.enable) {
            await this.provider.enable();
        }
        this.activeNetwork = await this.web3.eth.net.getId();
        const accounts = await this.web3.eth.getAccounts();
        this.defaultAccount = accounts && accounts[0];
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
    parseEtherValue: function (value, inbound=false) {
        return inbound ?
            value / constants.ETHER :
            value * constants.ETHER;
    },
    fetchGeneratedCount: async function (abi={}, address) {
        const generator = await new this.web3.eth.Contract(abi, address);
        return (await generator.methods.viewTotal().call()).valueOf();
    },
    methodTransaction: function (contract, method, { from, gas, gasPrice, value },  ...args) {
        const txConfig = this.extractTransactionConfig({ from, gas, gasPrice, value});
        const tx = contract.methods[method](...args).send(txConfig);
        return tx;
    },
    resolveFrom: function (from) {
        if (!addressUtils.exists(from)) {
            return this.defaultAccount;
        } else {
            return from;
        }
    },
    setEventListeners: function (tx, {onData, onChanged, onTransactionHash, onReceipt, onConfirmation, onError}={}) {
        if (onError) {
            tx.on('error', onError);
        }
        if (onTransactionHash) {
            tx.once('transactionHash', onTransactionHash);
        }
        if (onReceipt) {
            tx.once('receipt', onReceipt);
        }
        if (onConfirmation) {
            tx.on('confirmation', onConfirmation);
        }
        if (onData) {
            tx.on('data', onData);
        }
        if (onChanged) {
            tx.on('change', onChanged);
        }
    }
}

export default web3Utils;