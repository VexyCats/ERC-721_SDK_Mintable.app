import { constants } from '../config';

/**
 * Utility to parse and process Ethereum Addresses
 * @exports utils/addressUtils
 */
const addressUtils = {
    /**Whether an address is provided
     * @param {string=} address variable to check if exists
     * @returns {bool}
     */
    exists: function (address) {
        return (address !== constants.NULL_ADDRESS_HEX && address !== constants.NULL_STRING && address !== constants.NULL_VALUE && address !== constants.NULL_NUMBER);
    },
    /**Whether provided address is valid
     * @param {object} web3 An instance of Web3 to carry out check
     * @param {string} address Address to check if valid
     * @returns {bool}
     */
    isValid: function (web3, address) {
        return web3.utils.isAddress(address);
    }
}

export default addressUtils;