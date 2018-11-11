const card = require('./Card');

class DeckOfCards {
    constructor() {
        this.theDeck = [];
    }

    initDeck(){
        let numOfCards;
        card.cardColors.forEach((color) => {
            card.cardAttr.forEach((attr) => {
                if(color === 'Colorful'){
                    if(attr === 'ChangeColor') {
                        numOfCards = 4;
                    } else if(attr === 'SuperTaki') {
                        numOfCards = 2;
                    } else {
                        numOfCards = 0;
                    }
                } else {
                    if (attr !== 'ChangeColor' && attr !== 'SuperTaki') {
                        numOfCards = 2;
                    }
                    else {
                        numOfCards = 0;
                    }
                }
                for (let i = 1; i <= numOfCards; i++) {
                    let theId = `${attr + '-' + color + '-' + i}`;
                    let theCard = card.create(color, attr, theId);
                    this.theDeck.push(theCard);
                }
            });
        });
        this.shuffleDeck();
    }

    popCardFromDeck() {
        return this.theDeck.pop();
    }

    getDeckTopCard() {
        return this.theDeck[this.theDeck.length - 1];
    }

    shuffleDeck() {
        this.theDeck = this.theDeck.map(card => {
            return [Math.random(), card];}).sort((card, random) => card[0] - random[0]).map(card => card[1]);
    }

    getCardsToDeck(srcDeck) {
        this.theDeck.push(...srcDeck);
    }

    
    addCardsToDeck(srcDeck) {
        this.theDeck.push(...srcDeck);
    }


    getCardPosById(id){ 
        for(let i = 0; i < this.theDeck.length; i++){
            if(this.theDeck[i].id === id){
                return i;
            }
        }
        return null;
    }

    pushCard(card){ this.theDeck.push(card); }
    
    length(){ return this.theDeck.length; }
    
    popById(id){ return this.theDeck.splice(this.getCardPosById(id), 1); }

    getAllTheCards(){ return this.theDeck; }
    
    getCardById(id) { 
        const thePos = this.getCardPosById(id); 
        return this.theDeck[thePos]; 
    }

    getCardsFromTableToDeck() {
        return this.theDeck.splice(0,this.theDeck.length-1);
    }

    getAllCardsOfAttr(attr){ return this.theDeck.filter(card => card.attr === attr) ; }

    getAllSpecialCards(){ return this.theDeck.filter(card => ((parseInt(card.attr)>=1 && parseInt(card.attr)<=9)) === true) ;}
    getCardByIndex(i){ return this.theDeck[i]; }
    getAllCardsOfColor(color){ return this.theDeck.filter(card => card.color === color) ; }
}

function create() {return new DeckOfCards();}

module.exports = {create}