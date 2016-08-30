var lookupTable = getGemsCoordinateLookupTable();

function destroyAllGems() {
    $gems.each(function () {
        $(this).addClass("gem-destroyed");
    });
}

function setGemColor(row, col, color) {
    getGem(lookupTable, row, col).removeClass("gem-destroyed").addClass("gem-" + color);
}

function swapGems(firstRow, firstCol, secondRow, secondCol) {
    return function() {
        getGem(lookupTable, firstRow, firstCol).click();
        getGem(lookupTable, secondRow, secondCol).click();
    };
}

var timeoutCounter = 0;
function step(action) {
    timeoutCounter += 333;
    setTimeout(action, timeoutCounter);
}