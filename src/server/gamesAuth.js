const usersAuth = require('./usersAuth');

const gamesList = {};

//MIDDLEWARE FUNCS
function addUserToGame(req, res, next){
    const gameFromReq = JSON.parse(req.body);
    const username = usersAuth.getUserNameBySessionId(req.session.id);
    const gamename = gameFromReq.gamename;

    if(gameAuthentication(gamename) === false) {
        res.status(409).send("Game name does not exist!");
    }
    else if(gamesList[gamename].players.includes(username) === true) {
        res.status(409).send("You already registered to this game!");
    }
    else{
        gamesList[gamename].players.push(username);
        updateIfGameReady(gamesList[gamename]);
        next();
    }
}

function addSpectatorToGame(req, res, next){
    const gameFromReq = JSON.parse(req.body);
    const username = usersAuth.getUserNameBySessionId(req.session.id);
    const gamename = gameFromReq.gamename;

    if(gameAuthentication(gamename) === false) {
        res.status(409).send("Game name does not exist!");
    } else {
        gamesList[gamename].spectators.push(username);
        next();
    }
}

function leaveGame(req, res, next){
    const gameFromReq = JSON.parse(req.body);
    const username = usersAuth.getUserNameBySessionId(req.session.id);
    const gamename = gameFromReq.gamename;
    if(gamesList[gamename]){
        if(gamesList[gamename].players.includes(username))
        {
            if(gamesList[gamename].isActive === false){
                const userIndex = gamesList[gamename].players.findIndex((user) => {return user === username});
                gamesList[gamename].players.splice(userIndex,1);
            }
        }
        if(gamesList[gamename].spectators.includes(username))
        {
            const userIndex = gamesList[gamename].spectators.findIndex((user) => {return user === username});
            gamesList[gamename].spectators.splice(userIndex,1);
        }
    }
    next();
}

function addGameToAuthList(req, res, next) { //error 409 = conflict
    const gameFromReq = JSON.parse(req.body);
    const _isCompPlay = gameFromReq.isCompPlay;
    const _playersNum = parseInt(gameFromReq.playersNum);

    if(gameAuthentication(gameFromReq.gamename) === true){
        res.status(409).send("Game name already exist");
    } else {
        gamesList[gameFromReq.gamename] = {
            name: gameFromReq.gamename,
            creator: usersAuth.getUserNameBySessionId(req.session.id),
            playersNum: _playersNum,
            isCompPlay: _isCompPlay,
            isActive: false,
            players: [],
            spectators: []
        };
        next();
    }
}

function removeGameFromAuthList(req, res, next) {
    const gameFromReq = JSON.parse(req.body);
    const gamename = gameFromReq.gamename;
    const username = usersAuth.getUserNameBySessionId(req.session.id);

    if(gameAuthentication(gamename) === false) {
        res.status(409).send("Game name does not exist!");
    }
    else if(gamesList[gamename].creator !== username) { // error 403 = forbidden
        res.status(403).send("You cant remove this game!");
    } else {
        gamesList[gamename] = undefined;
        next();
    }
}

//MIDDLEWARE UTILS
function restartGameEntry(gamename){
    if(gamesList[gamename]){
        if(gamesList[gamename].isActive === true){
            gamesList[gamename].isActive = false;
            gamesList[gamename].players = [];
            gamesList[gamename].spectators = [];
        }
    }
}

function getSpectators(gamename) {
    if(gamesList){
        if(gamesList[gamename]){
            return gamesList[gamename].spectators;
        }
    }
    return [];
}

function removeGameByName(gamename) { delete gamesList[gamename]; }

function getGameInfo(gamename) { return gamesList[gamename]; }

function gameAuthentication(gamename) { return gamesList[gamename] !== undefined; }

function getGamesList(){ return gamesList; }

function updateIfGameReady(gameEntry) {
    if (gameEntry.isCompPlay === true) {
        if (gameEntry.players.length === gameEntry.playersNum - 1) {
            gameEntry.players.push("compy");
            gameEntry.isActive = true;
        }
    } else {
        if (gameEntry.players.length === gameEntry.playersNum) {
            gameEntry.isActive = true;
        }
    }
}

module.exports = {removeGameByName, addSpectatorToGame,getSpectators, restartGameEntry, gameAuthentication, getGameInfo, leaveGame, getGamesList, addGameToAuthList, removeGameFromAuthList, addUserToGame}

//
// if(gamesList[gamename]){
//     if(!usersAuth.isUserExist(gamesList[gamename].creator)){
//         delete gamesList[gamename];
//     } else {
//     }
// }