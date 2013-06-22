
function parse(param) {
    return {
        parse: function (text) {
            if (text === param)
                return text;
            return null;
        }
    }
}

module.exports = {
    parse: parse
};