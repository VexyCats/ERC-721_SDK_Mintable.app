import { constants } from '../config';

const addressUtils = {
    exists: function (address) {
        return (address !== constants.NULL_ADDRESS_HEX && address !== constants.NULL_STRING && address !== constants.NULL_VALUE && address !== constants.NULL_NUMBER);
    }
}

export default addressUtils;