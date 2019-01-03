import { constants } from '../../config';

const addressUtils = {
    exists: function (address) {
        return (from !== constants.NULL_ADDRESS_HEX && from !== constants.NULL_STRING && from !== constants.NULL_VALUE && from !== constants.NULL_NUMBER);
    }
}

export default addressUtils;