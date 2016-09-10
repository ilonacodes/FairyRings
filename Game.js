const NEIGHBOUR_DISTANCE = 1;
var selectedGem = null;
var score = 0;
var gameIsGoing = true;

function forEachGem(query, action) {
    $(query).each(function () {
        var $gem = $(this);
        action($gem);
    });
}

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

    forEachGem(".gem", function ($gem) {
        putGemIntoTable(table, $gem);
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
    return $(gem).hasClass("gem-destroyed");
}

function isAlreadyDestroying(gem) {
    return $(gem).hasClass("gem-ready-to-be-destroyed") ||
        $(gem).hasClass("gem-destroying");
}

function allGemsHaveSameClass(gems, name) {
    var firstGem = gems[0];

    if (thereIsNoGem(firstGem) || isDestroyedGem(firstGem) || isAlreadyDestroying(firstGem)) {
        return false;
    }

    for (var index = 1; index < gems.length; index++) {
        if (firstGem.attr("class") !== gems[index].attr("class")) {
            return false;
        }
    }

    return true;
}

function markGemAsReadyToBeDestroyed(gem) {
    gem.addClass("gem-ready-to-be-destroyed");
}

function destroyGems(gems) {
    for (var index = 0; index < gems.length; index++) {
        markGemAsReadyToBeDestroyed(gems[index]);
    }
}

function getGemsToBeDestroyedWithPattern(lookupTable, rowOffsets, colOffsets, name) {
    var gemsToBeDestroyed = [];

    for (var row = 0; row < lookupTable.length; row++) {
        for (var col = 0; col < lookupTable[row].length; col++) {
            var gems = getGemsWithPattern(lookupTable, row, col, rowOffsets, colOffsets);

            if (allGemsHaveSameClass(gems, name)) {
                for (var index = 0; index < gems.length; index++) {
                    gemsToBeDestroyed.push(gems[index]);
                }
            }
        }
    }

    return gemsToBeDestroyed;
}

var colors = ["red", "green", "yellow", "violet", "blue"];

function generateRandomColor() {
    var randomValue = Math.random();

    return colors[Math.floor(5 * randomValue)];
}

var $gems = $(".gem");

function enableGravity() {
    var lookupTable = getGemsCoordinateLookupTable();

    setInterval(function () {
        forEachGem(".gem", function ($gem) {
            var coordinates = getGemCoordinates($gem);
            var $downGem = getGem(lookupTable, coordinates.row + 1, coordinates.col);

            if (isDestroyedGem($downGem) && !isDestroyedGem($gem)) {
                $gem.addClass("gem-falling");
            } else {
                $gem.removeClass("gem-fallen");
            }
        });

        forEachGem(".gem-falling", function ($gem) {
            var coordinates = getGemCoordinates($gem);
            var $downGem = getGem(lookupTable, coordinates.row + 1, coordinates.col);

            $gem.removeClass("gem-falling").addClass("gem-fallen");

            swapClassNames($gem, $downGem);
            var $previousGem = $gem;
            coordinates = getGemCoordinates($previousGem);
            var $upGem = getGem(lookupTable, coordinates.row - 1, coordinates.col);

            while ($upGem.hasClass("gem") && !isDestroyedGem($upGem)) {
                swapClassNames($previousGem, $upGem);
                $previousGem = $upGem;
                coordinates = getGemCoordinates($previousGem);
                $upGem = getGem(lookupTable, coordinates.row - 1, coordinates.col);
            }
        });

        findGemsAndDestroy();
    }, 50);
}

function cancelPlayerTurn(clickedGem, selectedGemBeforeSwap) {
    swapClassNames(clickedGem, selectedGemBeforeSwap);
}

function generateNewRowOfGems() {
    forEachGem(".gem-destroyed", function ($gem) {
        if (getGemCoordinates($gem).row === 0) {
            $gem.attr("class", "gem gem-" + generateRandomColor());
        }
    });
}

function updateScore(foundGems) {
    var memo = [];

    for (var index = 0; index < foundGems.length; index++) {
        var gem = foundGems[index];
        var coordinates = gem.attr("coordinates");

        if (memo.indexOf(coordinates) === -1) {
            score++;
            memo.push(coordinates);
        }
    }

    $("div.score").text("SCORE: " + score);
    console.log("SCORE: " + score);
}

function findGemsAndDestroy() {
    var lookupTable = getGemsCoordinateLookupTable();

    var gemsToBeDestroyedByCol = getGemsToBeDestroyedWithPattern(lookupTable, [0, 1, 2], [0, 0, 0], "3 in column");
    var gemsToBeDestroyedByRow = getGemsToBeDestroyedWithPattern(lookupTable, [0, 0, 0], [0, 1, 2], "3 in row");

    var foundGems = gemsToBeDestroyedByCol.concat(gemsToBeDestroyedByRow);

    destroyGems(foundGems);
    generateNewRowOfGems();
    updateScore(foundGems);

    return foundGems;
}

function tryToMakePlayerTurn(clickedGem) {
    var selectedGemBeforeSwap = selectedGem;

    swapGemWithSelected(clickedGem);

    var foundGems = findGemsAndDestroy();

    if (foundGems.length === 0) {
        cancelPlayerTurn(clickedGem, selectedGemBeforeSwap);
    }
}

$gems.click(function () {
    var clickedGem = this;

    if (!gameIsGoing) {
        return;
    }

    if (isSelected(clickedGem)) {
        deselectGem(clickedGem);

    } else if (someGemIsSelected()) {
        if (areNeighbours(clickedGem, selectedGem) && !isDestroyedGem(selectedGem) && !isDestroyedGem(clickedGem)) {
            tryToMakePlayerTurn(clickedGem);
        } else {
            deselectGem(selectedGem);
        }

    } else if (!isDestroyedGem(clickedGem)) {
        selectGem(clickedGem);
    }
});

var timeLeft = 60;

function gameOver() {
    gameIsGoing = false;
    $("body").addClass("game-over");
    console.log("Game Over");
}

setInterval(function () {
    timeLeft--;

    var date = new Date(null);
    date.setSeconds(timeLeft);
    var timeLeftString = date.toLocaleTimeString([], {
        hours: null,
        minutes: "numeric",
        seconds: "numeric",
        hour12: false
    });
    var timeSeconds = timeLeftString.substr(timeLeftString.length - 5);

    if (timeLeft < 0) {
        gameOver();
    } else {

        $("div.timer").text("TIMER: " + timeSeconds);
        console.log("TIMER: " + timeSeconds);

    }

}, 1000);

setInterval(function () {
    forEachGem(".gem-destroying", function ($gem) {
        $gem.removeClass("gem-destroying").addClass("gem-destroyed");
    });

    forEachGem(".gem-ready-to-be-destroyed", function ($gem) {
        $gem.removeClass("gem-ready-to-be-destroyed").addClass("gem-destroying");
    });
}, 200);