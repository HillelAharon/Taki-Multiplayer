const deckOfCards = require('../cards/DeckOfCards');
const playerStat = require('./PlayerStat');

class Player {
    constructor(name) {
        this._name = name;
        this._deck = deckOfCards.create();
        this._statistics = playerStat.create();
    }

    get name() {
        return this._name;
    }

    get deck() {
        return this._deck;
    }

    get statistics() {
        return this._statistics;
    }

    getCardById(id) {
        return this._deck.getCardById(id);
    }

    getDeckAsCardsArr(){
        return this._deck.getAllTheCards();
    }

    getAverageTime(){
        return this._statistics.averageTimePerPlay;
    }
    
    getLastCardCounter(){
        return this._statistics.lastCardCounter;
    }

    lastCardInMyHand(){
        if(this._deck.length() === 1){
            this._statistics.incLastCardCounter();
        }  
    }
    //
    // getNumberOfCards() {
    //     return this._deck.getSize();
    // }
    //
    // addCard(card) {
    //     this.deck.addCard(card);
    // }
    //
    // putCard(card) {
    //     this.deck.removeCard(card);
    // }
}

function create(name) {return new Player(name);}

module.exports = {create}