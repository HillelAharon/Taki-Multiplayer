const CARD_COLORS = ['Red','Blue', 'Green', 'Yellow', 'Colorful'];
const CARD_ATTR = ['1', '3', '4', '5', '6', '7', '8', '9','ChangeColor', 'Stop', 'Plus', 'Taki','Plus2','SuperTaki'];


class Card {
    constructor(color , attr, id) {
        this._color = color;
        this._attr = attr;
        this._id = id;
    }
    get color(){
        return this._color;
    }
    get attr(){
        return this._attr;
    }
    get id(){
        return this._id;
    }
    set color(color){
        this._color = color;
    }
    set attr(attr){
        this._attr = attr;
    }
    set id(id){
        this._id = id;
    }
}

function create(color , attr, id){return new Card(color , attr, id);}

module.exports = {create, cardColors: CARD_COLORS, cardAttr: CARD_ATTR}