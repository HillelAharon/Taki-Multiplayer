const express = require('express');
const router = express.Router();
const gamesAuth = require('./gamesAuth');
const gamesLogicAuth = require('./gamesLogicAuth');
const userAuth = require('./usersAuth');

const gameManagement = express.Router();

//POST ROUTES
gameManagement.post("/addGame", gamesAuth.addGameToAuthList, (req, res) => {
    res.sendStatus(200);
});

gameManagement.post("/removeGame", gamesAuth.removeGameFromAuthList, (req, res) => {
    res.sendStatus(200);
});

gameManagement.post("/joinGame", gamesAuth.addUserToGame, (req,res) =>{
    res.sendStatus(200);
});


gameManagement.post("/watchGame", gamesAuth.addSpectatorToGame, (req,res) =>{
    res.sendStatus(200);
});

gameManagement.post("/leaveGame", gamesAuth.leaveGame, (req,res) =>{
    res.sendStatus(200);
});

gameManagement.post("/gameInfo", (req, res) => {
    const gamename = JSON.parse(req.body).gamename;
    res.json(gamesAuth.getGameInfo(gamename));
});

gameManagement.post("/initGame", gamesLogicAuth.initGame, (req,res) =>{
    res.sendStatus(200);
});

gameManagement.post("/gameStatus", (req,res) =>{
    const gamename = JSON.parse(req.body).gamename;
    const username = JSON.parse(req.body).username;
    const gameStatus = gamesLogicAuth.getGameStatus(gamename,username);
    if(gameStatus){
        gameStatus.spectators = gamesAuth.getSpectators(gamename);
    }
    res.json(gameStatus);
});

gameManagement.post("/gameSummery", (req,res) =>{
    const gamename = JSON.parse(req.body).gamename;
    const gameSummery = gamesLogicAuth.getGameSummery(gamename);
    setTimeout( () => {gamesAuth.restartGameEntry(gamename);},5000);
    setTimeout( () => {gamesLogicAuth.restartGameLogic(gamename);},5000);
    res.json(gameSummery);
});

gameManagement.post("/takeCard", gamesLogicAuth.takeCard, (req,res) =>{
    res.sendStatus(200);
});

gameManagement.post("/putCard", gamesLogicAuth.putCard, (req,res) =>{
    res.sendStatus(200);
});

gameManagement.post("/chooseColor", gamesLogicAuth.chooseColor, (req,res) =>{
    res.sendStatus(200);
});


//GET ROUTES
gameManagement.get("/allGames", (req, res) => {
    let theGames = gamesAuth.getGamesList();

    for(gamename in theGames){
        let game = theGames[gamename];
        if(game){
            if(!userAuth.isUserExist(game.creator) && game.players.length === 0 && game.spectators.length === 0){
                gamesAuth.removeGameByName(gamename);
                theGames = gamesAuth.getGamesList();
            }
        }
    }
    res.json(theGames);
});



module.exports = gameManagement;