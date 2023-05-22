//includesNotCaseSensitive
function includesNCS(oneStr, twoStr) {
    return oneStr.toUpperCase().includes(twoStr.toUpperCase());
}

//includesEachotherNotCaseSensitive
function includesENCS(oneStr, twoStr) {
    if (
        oneStr.toUpperCase().includes(twoStr.toUpperCase()) ||
        twoStr.toUpperCase().includes(oneStr.toUpperCase())
    ) {
        return true;
    }
    return false;
}

module.exports = {
    includesNCS,
    includesENCS,
};
