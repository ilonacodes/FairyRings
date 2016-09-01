const NEIGHBOUR_DISTANCE = 1;
var selectedGem = null;

function swapClassNames(leftElement, rightElement) {
    var thisClassName = $(leftElement).attr("class");
    $(leftElement).attr("class", $(rightElement).attr("class"));
    $(rightElement).attr("class", thisClassName);
}

function deselectGem(gem) {
    $(gem).removeClass("selected");
    selectedGem = null;
}

function isSelected(gem) {
    return selectedGem === gem;
}

function someGemIsSelected() {
    return selectedGem !== null;
}

function swapGemWithSelected(gem) {
    swapClassNames(gem, selectedGem);
    deselectGem(gem);
}

function selectGem(gem) {
    $(gem).addClass("selected");
    selectedGem = gem;
}

function getGemCoordinates(gem) {
    return {
        col: ($(gem).offset().left - 11) / 34,
        row: ($(gem).offset().top - 11) / 34
    };
}

function columnDistance(coordinates, otherCoordinates) {
    return Math.abs(coordinates.col - otherCoordinates.col);
}

function rowDistance(coordinates, otherCoordinates) {
    return Math.abs(coordinates.row - otherCoordinates.row);
}

function getDistance(gem, otherGem) {
    var coordinates = getGemCoordinates(gem);
    var otherCoordinates = getGemCoordinates(otherGem);
    return columnDistance(coordinates, otherCoordinates) + rowDistance(coordinates, otherCoordinates);
}

function areNeighbours(gem, otherGem) {
    return getDistance(gem, otherGem) === NEIGHBOUR_DISTANCE;
}

function putGemIntoTableByCoordinates(table, row, col, gem) {
    table[row] = table[row] || [];
    table[row][col] = gem;
}

function putGemIntoTable(table, gem) {
    var coordinates = getGemCoordinates(gem);

    $(gem).attr("coordinates", JSON.stringify(coordinates));
    putGemIntoTableByCoordinates(table, coordinates.row, coordinates.col, gem);
}
function getGemsCoordinateLookupTable() {
    var table = [];

    $(".gem").each(function () {
        putGemIntoTable(table, $(this));
    });
    return table;
}

function getGem(lookupTable, row, col) {
    var lookupRow = lookupTable[row];

    if (!lookupRow) {
        return $(null);
    }

    return $(lookupRow[col]);
}

function getGemsWithPattern(lookupTable, row, col, rowOffsets, colOffsets) {
    var gems = [];

    for (var index = 0; index < rowOffsets.length; index++) {
        gems.push(getGem(lookupTable, row + rowOffsets[index], col + colOffsets[index]));
    }

    return gems;
}

function thereIsNoGem(gem) {
    return !gem.attr("class");
}

function isDestroyedGem(gem) {
    return gem.hasClass("gem-destroyed");
}

function allGemsHaveSameClass(gems, name) {
    var firstGem = gems[0];

    if (thereIsNoGem(firstGem) || isDestroyedGem(firstGem)) {
        return false;
    }

    for (var index = 1; index < gems.length; index++) {
        if (firstGem.attr("class") !== gems[index].attr("class")) {
            return false;
        }
    }

    return true;
}

function destroyGem(gem) {
    gem.addClass("gem-destroyed");
}

function destroyGems(gems) {
    for (var index = 0; index < gems.length; index++) {
        destroyGem(gems[index]);
    }
}

function getGemsToBeDestroyedWithPattern(lookupTable, rowOffsets, colOffsets, name) {
    var gemsToBeDestroyed = [];

    for (var row = 0; row < lookupTable.length; row++) {
        for (var col = 0; col < lookupTable[row].length; col++) {
            var gems = getGemsWithPattern(lookupTable, row, col, rowOffsets, colOffsets);

            if (allGemsHaveSameClass(gems, name)) {
                gemsToBeDestroyed.push(gems);
            }
        }
    }

    return gemsToBeDestroyed;
}

function generateRandomColor() {
    var randomValue = Math.random();

    if (randomValue < 0.25) return "red";
    if (randomValue < 0.50) return "green";
    if (randomValue < 0.75) return "yellow";
    return "blue";
}

var $gems = $(".gem");

function enableGravity() {
    var lookupTable = getGemsCoordinateLookupTable();

    setInterval(function () {
        $gems.each(function () {
            var $gem = $(this);
            var coordinates = getGemCoordinates($gem);
            var $downGem = getGem(lookupTable, coordinates.row + 1, coordinates.col);

            if (isDestroyedGem($downGem) && !isDestroyedGem($gem)) {
                swapClassNames($gem, $downGem);
            }
        });
    }, 50);
}

$gems.click(function () {
    var clickedGem = this;

    if (isSelected(clickedGem)) {
        deselectGem(clickedGem);
    } else {
        if (someGemIsSelected()) {
            if (areNeighbours(clickedGem, selectedGem)) {
                var selectedGemBeforeSwap = selectedGem;

                swapGemWithSelected(clickedGem);

                var lookupTable = getGemsCoordinateLookupTable();

                var gemsToBeDestroyedByCol = getGemsToBeDestroyedWithPattern(lookupTable, [0, 1, 2], [0, 0, 0], "3 in column");
                var gemsToBeDestroyedByRow = getGemsToBeDestroyedWithPattern(lookupTable, [0, 0, 0], [0, 1, 2], "3 in row");

                if (gemsToBeDestroyedByCol.length === 0 && gemsToBeDestroyedByRow.length === 0) {
                    swapClassNames(clickedGem, selectedGemBeforeSwap);
                }

                var index;

                for (index = 0; index < gemsToBeDestroyedByCol.length; index++) {
                    destroyGems(gemsToBeDestroyedByCol[index]);
                }

                for (index = 0; index < gemsToBeDestroyedByRow.length; index++) {
                    destroyGems(gemsToBeDestroyedByRow[index]);
                }

            } else {
                deselectGem(selectedGem);
            }

        } else {
            selectGem(clickedGem);
        }
    }
});
