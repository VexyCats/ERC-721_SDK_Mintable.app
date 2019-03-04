import { constants } from '../config';

const addressUtils = {
    exists: function (address) {
        return (address !== constants.NULL_ADDRESS_HEX && address !== constants.NULL_STRING && address !== constants.NULL_VALUE && address !== constants.NULL_NUMBER);
    },
    isValid: function (web3, address) {
        return web3.utils.isAddress(address);
    }
}

export default addressUtils;