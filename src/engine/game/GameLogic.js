//import React from 'react'
//const card = require('../cards/Card');
const deckOfCards = require('../cards/DeckOfCards');
const player = require('../players/Player');
//const card = require('../cards/Card');

class GameLogic {
    constructor(_players, _gamename, _isCompPlay){
        this.gamename = _gamename;
        this.theDeck = deckOfCards.create('theDeck');
        this.tablePack = deckOfCards.create('tablePack');
        this.players = _players;
        this.isCompPlay = _isCompPlay;
        this.COMP_TURN =  _players.length - 1;
        this.playersRank = [];

        this.turnsManager = {
            currentTurn : 0,
            inTakiTime : false,
            plus2War : 0,
            movesCounter : 0,
            choosingColorTime : false,
        };

        this.timer = {
            min: 0,
            sec: 0,
            time: `00:00`,
            timerInterval: 0
        };

        this.JSONgameState = {
            isActive: true,
            playersCards: [],
            playersRank: [],
            newColorNotifications: [],
            tablePackTop: null,
            currentTimer: ``,
            currentPlayer: null,
            newColorNotificationCounter : 0,
            choosingColorTime: false,
            lastCard: null,
            avgTime: ``
        };

        this.initGame();
    }

    //----------------------------------------------INIT FUNCS----------------------------------------------------------
    initGame() {
        this.theDeck.initDeck();
        this.initTablePack();
        this.initPlayers();
        this.updateJSONgameState();
        this.players[0].statistics.turnTimerOn();
        this.timer.timerInterval = setInterval(this.incTimer.bind(this),1000);
    }

    initPlayers() {
        for(let i = 0; i<this.players.length; i++){
            let playerName = this.players[i];
            this.players[i] = player.create(playerName);
            this.players[i].deck.getCardsToDeck(this.theDeck.getAllTheCards().splice(0,8));
        }
    }

    initTablePack() {
        let cardToPop = [];

        do {
            cardToPop.push(this.theDeck.popCardFromDeck());
        } while(isNaN(cardToPop[cardToPop.length - 1].attr));

        this.tablePack.pushCard(cardToPop.pop());
        this.theDeck.addCardsToDeck(cardToPop);
    }


    //-----------------------------------------------UPDATERS----------------------------------------------------------

    updateTurnsManager(newCard) {
        let currentPlayerIndex = this.turnsManager.currentTurn;
        //console.log(currentPlayerIndex);
        let nextPlayerIndex;

        if (newCard === null) {
            this.turnsManager.plus2War = 0;
            nextPlayerIndex = ((currentPlayerIndex + 1) % this.players.length);
        }
        else {
            if (newCard.attr !== 'Plus' && this.players[currentPlayerIndex].deck.length() === 0) {
                if(!(newCard.attr === 'ChangeColor' && this.getCurrentPlayer().name !== "compy")) {
                    this.playersRank.push(this.getCurrentPlayer().name);
                }
            }
           if(newCard.attr === 'Taki' || newCard.attr === 'SuperTaki' || this.turnsManager.inTakiTime === true){
                this.turnsManager.inTakiTime = true;

                if(this.getPlayerListOfMoves().length === 0){
                    this.turnsManager.inTakiTime = false;
                }
            }

            this.turnsManager.plus2War = (this.turnsManager.inTakiTime === true ? 0 : (newCard.attr === 'Plus2' ? this.turnsManager.plus2War + 2 : 0));

            if (this.turnsManager.inTakiTime === true || newCard.attr === 'Plus') {
                nextPlayerIndex = currentPlayerIndex;
            }
            else if (newCard.attr === 'Stop') {
                nextPlayerIndex = this.getNextPlayer(currentPlayerIndex);
                nextPlayerIndex = this.getNextPlayer(nextPlayerIndex);
            }
            else if (newCard.attr === 'ChangeColor' && this.getCurrentPlayer().name !== "compy") {
                this.turnsManager.choosingColorTime = true;
                nextPlayerIndex = currentPlayerIndex;
            } else {
                nextPlayerIndex = ((currentPlayerIndex + 1) % this.players.length);
            }
        }

        if(!(newCard !== null && (newCard.attr === "Plus" || (newCard.attr === 'ChangeColor' && this.getCurrentPlayer().name !== "compy")))){
            while (this.players[nextPlayerIndex].deck.length() === 0){
                nextPlayerIndex = (++nextPlayerIndex % this.players.length);
            }
        }

        if (nextPlayerIndex === this.COMP_TURN && this.isCompPlay === true && !this.isGameOver()) {
            setTimeout(() => {
                this.compTurn();
            }, 2000);
        }

        if (!(this.turnsManager.choosingColorTime || this.turnsManager.inTakiTime || (newCard !== null && newCard.attr === "Plus"))) {
            this.updatePlayerStat(this.turnsManager.currentTurn,nextPlayerIndex);
        }
        ++this.turnsManager.movesCounter;
        this.turnsManager.currentTurn = nextPlayerIndex;
        this.updateJSONgameState();
    }

    updatePlayerStat(currentP,nextP) {
        this.players[currentP].lastCardInMyHand();
        if(!this.turnsManager.inTakiTime){
            this.players[currentP].statistics.turnTimerOff();
            this.players[nextP].statistics.turnTimerOn();
        }
    }

    updateJSONgameState(){
        for( let i = 0 ; i < this.players.length ; i++ ){
           this.JSONgameState.playersCards[i] = this.players[i].deck.getAllTheCards().map(card => card.id);
        }
        this.JSONgameState.choosingColorTime = this.turnsManager.choosingColorTime;
        this.JSONgameState.isActive = this.playersRank.length < this.players.length - 1;
        this.JSONgameState.tablePackTop = this.getTablePackTop().id;
        this.JSONgameState.currentPlayer = this.players[this.turnsManager.currentTurn].name;
        this.JSONgameState.currentTimer = this.timer.time;
        this.JSONgameState.playersRank = this.playersRank;
    }

    incTimer() {
        if(this.timer.sec === 59){
            ++this.timer.min;
        }
        this.timer.sec = this.timer.sec === 59 ? 0 : ++this.timer.sec;
        let secToShow =  this.timer.sec < 10 ? `0${this.timer.sec}` : `${this.timer.sec}`;
        let minToShow = this.timer.min < 10 ? `0${this.timer.min}` : `${this.timer.min}`;
        this.timer.time = minToShow + `:` + secToShow;
        this.updateJSONgameState();
    }

    //----------------------------------------------COMMUNICATION-------------------------------------------------------

    checkValidAndPutCardByCardId(cardId) {
        const card = this.getCurrentPlayer().deck.getCardById(cardId);
        if(this.isValidMove(card)){
            this.putCardOnTable(card);
            return true;
        } else {
            return false;
        }
    }

    checkValidAndTakeCardFromDeck() {
        if(this.getPlayerListOfMoves().length === 0) {
            this.takeCardFromDeck();
            return true;
        } else {
            return false;
        }
    }

    setNewColor(playersColorChoice) {
        let tablePackTop = this.getTablePackTop();
        let nextPlayerIndex = (this.turnsManager.currentTurn + 1)%this.players.length;
        let cardIdArr = tablePackTop.id.split('-');
        cardIdArr[1] = playersColorChoice;
        tablePackTop.color = playersColorChoice;
        tablePackTop.id = `${cardIdArr[0]}-${cardIdArr[1]}-${cardIdArr[2]}`;

        this.turnsManager.choosingColorTime = false;
        if(this.getCurrentPlayer().deck.length() === 0){
            this.playersRank.push(this.getCurrentPlayer().name);
        }

        while (this.players[nextPlayerIndex].deck.length() === 0) {
            nextPlayerIndex = (++nextPlayerIndex % this.players.length);
        }

        if (nextPlayerIndex === this.COMP_TURN && this.isCompPlay === true && !this.isGameOver()) {
            setTimeout(() => {
                this.compTurn();
            }, 2000);
        }

        this.updatePlayerStat(this.turnsManager.currentTurn,nextPlayerIndex);
        this.turnsManager.currentTurn = nextPlayerIndex;
        this.updateJSONgameState();
     }

    getJSONgameState(playerName) {
            let res = this.JSONgameState ;
            let playerIndex;
            for(let i = 0; i < this.players.length ; i++){
                if(this.players[i].name === playerName){
                    playerIndex = i;
                }
            }
            if(playerIndex !== undefined) {
                res.avgTime = this.players[playerIndex].getAverageTime().toFixed(2);
                res.lastCard = this.players[playerIndex].getLastCardCounter();
            }
            return res;
    }

    getJSONgameSummery() {
        let playersLastCard = [];
        let playersAvgTime = [];

        if(this.timer.timerInterval){ clearInterval(this.timer.timerInterval); }

        for( let i = 0 ; i < this.players.length ; i++ ){

            playersAvgTime.push(this.players[i].getAverageTime().toFixed(2));
            playersLastCard.push(this.players[i].getLastCardCounter());

            if(!this.playersRank.includes(this.players[i].name)){
                this.playersRank.push(this.players[i].name);
            }
        }

        return {
            isActive: false,
            playersRank: this.playersRank,
            totalTurns: this.turnsManager.movesCounter,
            totalTime: this.timer.time,
            playersLastCard: playersLastCard,
            playersAvgTime: playersAvgTime
        };
    }

    //--------------------------------------------------LOGIC-----------------------------------------------------------

    putCardOnTable(card) {
        this.players[this.turnsManager.currentTurn].deck.popById(card.id);
        if( card.attr === 'SuperTaki') {
            card.color = this.getTablePackTop().color;
            let cardIdArr = card.id.split('-');
            cardIdArr[1] = card.color;
            card.id = `${cardIdArr[0]}-${cardIdArr[1]}-${cardIdArr[2]}`;
        }
        this.tablePack.pushCard(card);
        this.updateTurnsManager(card);
    }

    takeCardFromDeck() {
        const currentPlayer = this.players[this.turnsManager.currentTurn];
        const numberOfCardsToTake = this.turnsManager.plus2War === 0 ? 1 : this.turnsManager.plus2War;

        for(let i = 0; i < numberOfCardsToTake; i++){
            currentPlayer.deck.pushCard(this.theDeck.popCardFromDeck());
        }

        if(this.theDeck.length() === 1) {
            this.theDeck.addCardsToDeck(this.tablePack.getCardsFromTableToDeck());
            this.theDeck.shuffleDeck();
        }

        this.updateTurnsManager(null);
    }

    isValidMove(card) {
        const tablePackTop = this.getTablePackTop();

        if ((card.attr === 'Taki' && tablePackTop.attr === 'SuperTaki') || (card.attr === 'SuperTaki' && tablePackTop.attr === 'Taki')) {
            return this.turnsManager.inTakiTime !== true;
        }
        else if (this.turnsManager.plus2War !== 0 && card.attr !== 'Plus2') {
            return false;
        }
        else if ((card.attr === 'ChangeColor' || card.attr === 'SuperTaki') && !this.turnsManager.inTakiTime) {
            return true;
        }
        else if (card.color !== tablePackTop.color && ((card.attr !== tablePackTop.attr) || (this.turnsManager.inTakiTime === true))) {
            return false;
        }
        else {
            return true;
        }
    }

    getTablePackTop(){ return this.tablePack.getDeckTopCard(); }

    getCurrentPlayer() { return this.players[this.turnsManager.currentTurn]; }

    getPlayerListOfMoves() {
        let currentPlayersDeck = this.players[this.turnsManager.currentTurn].getDeckAsCardsArr();
        let listOfMoves = currentPlayersDeck.filter((card) => (this.isValidMove(card)));
        return listOfMoves;
    }

    getNextPlayer(currentTurn){
        let next = ((currentTurn + 1)%this.players.length);
        while (this.players[next].deck.length() === 0) {
            next = (++next % this.players.length);
        }
        return next;
    }

    isGameOver() {return this.playersRank.length === (this.players.length - 1) ;}

    //-----------------------------------------------COMP LOGIC---------------------------------------------------------

    compTurn() {
        let sortedListOfMoves = this.sortPlayerListOfMoves();
        if (sortedListOfMoves.length > 0) {
            const theCard = sortedListOfMoves.pop();
            if(theCard.attr === 'ChangeColor'){
                theCard.color = this.chooseColorForComp();
                const cardIdArr = theCard.id.split('-');
                cardIdArr[1] = theCard.color;
                theCard.id = `${cardIdArr[0]}-${cardIdArr[1]}-${cardIdArr[2]}`;
            }
            this.putCardOnTable(theCard);
        }
        else {
            this.takeCardFromDeck();
        }
    }

    sortPlayerListOfMoves() {
        let listOfMoves = this.getPlayerListOfMoves();
        listOfMoves.sort((card1, card2) => {this.priorityCompare(card1, card2)});
        return listOfMoves;
    }

    priorityCompare(card1, card2) {
        const test = this.prioritySet(card1.attr) > this.prioritySet(card2.attr) ? card1 : card2;
        return test;
    }

    prioritySet(attr) {
        if (attr === 'Plus2') {
            return this.turnsManager.inTakiTime === true ? 1 : 6;
        }
        else if (attr === 'Taki') {
            return this.turnsManager.inTakiTime === true ? 2 : 5;
        }
        else if (attr === 'Plus') {
            return (this.turnsManager.inTakiTime === true && this.players[this.COMP_TURN].deck.getAllCardsOfAttr(attr).length > 1) ? 3 : 4;
        }
        else if (attr === 'Stop') {
            return 3;
        }
        else if (attr === 'ChangeColor') {
            return 0;
        }
        else {
            return this.turnsManager.inTakiTime === true ? 4 : 1;
        }
    }

    chooseColorForComp() {
        let theColor = 'Red'; // default value
        let compCards = this.players[this.players.length-1].getDeckAsCardsArr();
        let redCards = compCards.filter((card) => card.color === 'Red');
        let blueCards = compCards.filter((card) => card.color === 'Blue');
        let greenCards = compCards.filter((card) => card.color === 'Green');
        let yellowCards = compCards.filter((card) => card.color === 'Yellow');

        let maxColorAppears = redCards;
        if (maxColorAppears.length < blueCards.length) {
            maxColorAppears = blueCards;
        }
        if (maxColorAppears.length < greenCards.length) {
            maxColorAppears = greenCards;
        }
        if (maxColorAppears.length < yellowCards.length) {
            maxColorAppears = yellowCards;
        }

        if (maxColorAppears.length > 0) {
            theColor = maxColorAppears[0].color;
        }

        return theColor;
    }
}

function create(players, gamename, isCompPlay) { return new GameLogic(players,gamename, isCompPlay); }

module.exports = {create};

//
// updateTurnsManager(newCard) {
//
//     // let notifyCompNewColor = (this.getCurrentPlayer().name === "compy" && newCard !== null && newCard.attr === "ChangeColor") ? this.getTablePackTop().color : null ;
//
//     let currentPlayerIndex = this.turnsManager.currentTurn;
//
//     if (newCard === null) {
//         ++this.turnsManager.movesCounter;
//         this.turnsManager.plus2War = 0;
//         this.turnsManager.currentTurn = (++currentPlayerIndex % this.players.length);
//     }
//     else {
//         if (newCard.attr !== 'Plus' && this.currentPlayerFinishedHisCards() === true) {
//             if(!(newCard.attr === 'ChangeColor' && this.getCurrentPlayer().name !== "compy")) {
//                 this.playersRank.push(this.getCurrentPlayer().name);
//             }
//         }
//         this.turnsManager.inTakiTime = ((newCard.attr === 'Taki' || newCard.attr === 'SuperTaki' || this.turnsManager.inTakiTime === true) && this.getPlayerListOfMoves().length > 0);
//         this.turnsManager.plus2War = (this.turnsManager.inTakiTime === true ? 0 : (newCard.attr === 'Plus2' ? this.turnsManager.plus2War + 2 : 0));
//
//         if (this.turnsManager.inTakiTime === true || newCard.attr === 'Plus') {
//             this.turnsManager.currentTurn = currentPlayerIndex;
//         }
//         else if (newCard.attr === 'Stop') {
//             this.turnsManager.currentTurn = ((currentPlayerIndex + 2) % this.players.length);
//         }
//         else if (newCard.attr === 'ChangeColor' && this.getCurrentPlayer().name !== "compy") {
//             this.turnsManager.choosingColorTime = !this.turnsManager.choosingColorTime;
//         } else {
//             this.turnsManager.currentTurn = (++currentPlayerIndex % this.players.length);
//         }
//         ++this.turnsManager.movesCounter;
//     }
//
//     if (this.turnsManager.choosingColorTime === false) {
//         this.updatePlayerStat();
//     }
//
//     if (this.getPlayerListOfMoves().length === 0 && this.turnsManager.inTakiTime === true) {
//         this.turnsManager.inTakiTime = !this.turnsManager.inTakiTime;
//     }
//
//     while (this.currentPlayerFinishedHisCards() === true){
//         this.turnsManager.currentTurn = (++this.turnsManager.currentTurn % this.players.length);
//     }
//
//     if (this.turnsManager.currentTurn === this.COMP_TURN && this.isCompPlay === true) {
//         setTimeout(() => {
//             this.compTurn();
//         }, 2000);
//     }
//     //
//     // this.updateJSONgameState(notifyCompNewColor);
//     this.updateJSONgameState();
// }
