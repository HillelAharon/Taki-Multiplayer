class PlayerStat{
    constructor(){
        this.startTimer;
        this.endTimer;
        this.numberOfTurns = 0;
        this.averageTimePerPlay = 0;
        this.lastCardCounter = 0;
        this.totalTime = 0;
    }
    turnTimerOn() {
        this.startTimer = new Date();
    } 

    turnTimerOff() {
        this.numberOfTurns++;
        this.endTimer = new Date();
        let duration = (this.endTimer - this.startTimer)/1000;
        this.averageTimePerPlay = ((this.totalTime + duration) / this.numberOfTurns);
        this.totalTime += duration;
    }

    incLastCardCounter() { this.lastCardCounter++ ; }

    getAvg() {return this.averageTimePerPlay;}
    
    getLastCardCounter() {return this.lastCardCounter;}
}

function create() {return new PlayerStat();}

module.exports = {create}