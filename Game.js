const NEIGHBOUR_DISTANCE = 1;
var selectedGem = null;

function swapClassNames(lefElement, rightElement) {
    var thisClassName = $(lefElement).attr("class");
    $(lefElement).attr("class", $(rightElement).attr("class"));
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

function destroyGemsWithPattern(lookupTable, matching, rowOffsets, colOffsets, name) {
    for (var row = 0; row < lookupTable.length; row++) {
        for (var col = 0; col < lookupTable[row].length; col++) {
            var gems = getGemsWithPattern(lookupTable, row, col, rowOffsets, colOffsets);

            if (allGemsHaveSameClass(gems, name)) {
                matching = true;
                destroyGems(gems);
            }
        }
    }

    return matching;
}

function generateRandomColor() {
    var randomValue = Math.random();

    if (randomValue < 0.25) return "red";
    if (randomValue < 0.50) return "green";
    if (randomValue < 0.75) return "yellow";
    return "blue";
}

var $gems = $(".gem");

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

                var matching = false;

                matching = destroyGemsWithPattern(lookupTable, matching, [0, 1, 2, 2, 2], [0, 0, 0, 1, 2], "L shape");
                matching = destroyGemsWithPattern(lookupTable, matching, [0, 1, 2, 0, 0], [0, 0, 0, 1, 2], "L shape 90deg clockwise");
                matching = destroyGemsWithPattern(lookupTable, matching, [0, 1, 2, 2, 2], [2, 2, 0, 1, 2], "L shape 90deg counter-clockwise");
                matching = destroyGemsWithPattern(lookupTable, matching, [0, 1, 2, 2, 2], [0, 0, 0, 1, 2], "L shape 180deg");

                matching = destroyGemsWithPattern(lookupTable, matching, [0, 1, 2, 3, 4], [0, 0, 0, 0, 0], "5 in column");
                matching = destroyGemsWithPattern(lookupTable, matching, [0, 0, 0, 0, 0], [0, 1, 2, 3, 4], "5 in row");

                matching = destroyGemsWithPattern(lookupTable, matching, [0, 1, 2, 3], [0, 0, 0, 0], "4 in column");
                matching = destroyGemsWithPattern(lookupTable, matching, [0, 0, 0, 0], [0, 1, 2, 3], "4 in row");

                matching = destroyGemsWithPattern(lookupTable, matching, [0, 0, 0, 1, 2], [0, 1, 2, 1, 1], "T shape");
                matching = destroyGemsWithPattern(lookupTable, matching, [1, 1, 1, 0, 2], [0, 1, 2, 2, 2], "T shape 90deg clockwise");
                matching = destroyGemsWithPattern(lookupTable, matching, [0, 1, 2, 1, 1], [0, 0, 0, 1, 2], "T shape 90deg counter-clockwise");
                matching = destroyGemsWithPattern(lookupTable, matching, [0, 1, 2, 2, 2], [1, 1, 1, 0, 2], "T shape 90deg counter-clockwise");


                matching = destroyGemsWithPattern(lookupTable, matching, [0, 1, 2], [0, 0, 0], "3 in column");
                matching = destroyGemsWithPattern(lookupTable, matching, [0, 0, 0], [0, 1, 2], "3 in row");

                if (!matching) {
                    swapClassNames(clickedGem, selectedGemBeforeSwap);
                }

            } else {
                deselectGem(selectedGem);
            }

        } else {
            selectGem(clickedGem);
        }
    }
});