const gameLogic = require('../engine/game/GameLogic');
const gamesAuth = require('./gamesAuth');

const gamesLogicList = {};

//MIDDLEWARE FUNCS
function initGame(req, res, next){
    const newGameReq = JSON.parse(req.body);
    const gamename = newGameReq.gamename;
    const players = newGameReq.players;
    const isCompPlay = players[players.length - 1] === "compy";

    if(gamesLogicList[gamename] === undefined) {
        gamesLogicList[gamename] = gameLogic.create(players,gamename,isCompPlay);
    }
    next();
}

function getGameStatus(gamename,username) {
    if(gamesAuth.gameAuthentication(gamename) === false){
        return null;
    } else {
        return gamesLogicList[gamename].getJSONgameState(username);
    }
}


function getGameSummery(gamename) {
    if(gamesAuth.gameAuthentication(gamename) === false){
        return null;
    } else {
        return gamesLogicList[gamename].getJSONgameSummery();
    }
}

function putCard(req, res, next) {
    const parsedReq = JSON.parse(req.body);
    const gamename = parsedReq.gamename;
    const cardId = parsedReq.cardId;

    if(gamesLogicList[gamename].checkValidAndPutCardByCardId(cardId) === true ){
        next();
    } else {
        res.sendStatus(403);
    }
}

function takeCard(req, res, next) {
    const parsedReq = JSON.parse(req.body);
    const gamename = parsedReq.gamename;

    if(gamesLogicList[gamename].checkValidAndTakeCardFromDeck() === true ){
        next();
    } else {
        res.sendStatus(403);
    }
}

function chooseColor(req, res, next) {
    const parsedReq = JSON.parse(req.body);
    const gamename = parsedReq.gamename;
    const newColor = parsedReq.newColor;

    gamesLogicList[gamename].setNewColor(newColor);
    next();
}

function restartGameLogic(gamename) {
    if(gamesLogicList[gamename] !== undefined){
        gamesLogicList[gamename] = undefined;
    }
}


module.exports = {restartGameLogic, chooseColor, takeCard, putCard, getGameStatus, getGameSummery , initGame}



