function TimerPresenter() {

}

function presentTimeDigit(timeDigit) {
    var presentedSeconds = timeDigit.toString();
    if (timeDigit < 10) {
        presentedSeconds = "0" + timeDigit.toString();
    }
    return presentedSeconds;
}

TimerPresenter.prototype.presentTimer = function (rawSeconds) {
    var minutes = Math.floor(rawSeconds / 60);
    var seconds = rawSeconds % 60;

    return presentTimeDigit(minutes) + ":" + presentTimeDigit(seconds);
};