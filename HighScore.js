function HighScoreStore() {

}

HighScoreStore.prototype.load = function () {
    if (!localStorage.highScore) {
        return 0;
    }

    return parseFloat(localStorage.highScore);
};


HighScoreStore.prototype.save = function (newHighScore) {
    localStorage.highScore = newHighScore;
};
