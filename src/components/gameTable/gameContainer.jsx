import React from 'react';
import ColorButton from '../util/colorButton.jsx';
import {snackbarStatusMessage,snackbarInvalid} from '../../engine/snackBars/snackBar.js';
import '../../../Style/GameStyle.css';
import TakiLogo from '../../../Style/StyleImgs/icon.png';

const notificationConst = {
    PRE_GAME_STATUS : 'preGameStatus',
    INVALID_MOVE : 'invalidMove',
    NEW_COLOR : 'newColor'
}

const playerStatusConst = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    FINISHED_CARDS: 'finishedCards',
    SPECTATOR: 'spectator'
};


export default class GameContainer extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            players: [],
            isActive: false,
            statusMessage: "",
            gameStatus: null,
            gameSummery: null,
            playerStatus: props.playerStatus,
        };

        this.getGameInfo = this.getGameInfo.bind(this);
        this.initGame = this.initGame.bind(this);
        this.getGameStatus = this.getGameStatus.bind(this);
        this.renderTablePackTop = this.renderTablePackTop.bind(this);
        this.takeCardHandler = this.takeCardHandler.bind(this);
        this.renderPlayerHand = this.renderPlayerHand.bind(this);
        this.renderOpponentHand = this.renderOpponentHand.bind(this);
        this.renderStatistics = this.renderStatistics.bind(this);
        this.renderGameBoard = this.renderGameBoard.bind(this);
        this.chooseColorHandler = this.chooseColorHandler.bind(this);
        this.renderForSpectator = this.renderForSpectator.bind(this);
        this.notificationManager = this.notificationManager.bind(this);
        this.renderEndGamePopUp = this.renderEndGamePopUp.bind(this);
        this.getGameSummery = this.getGameSummery.bind(this);
    }

    componentWillMount(){
        this.getGameInfo();
    }

    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    render() {
        return (
            <div className={"game-Container"}>
                <img className={"logo"} src={TakiLogo}></img>
                {this.state.playerStatus !== playerStatusConst.PLAYING ? <button className={"util btn"} id={"leaveBtn"}value={this.props.gamename} onClick={() => this.props.leaveGameHandler(this.props.gamename)}></button> : null}
                {this.state.isActive === true || this.state.gameSummery !== null ? this.renderGameBoard() : null}
            </div>
        )
    }

//----------------------------------------------------RENDERERS---------------------------------------------------------

    renderGameBoard(){
        return(
            <div className={"gameBoard-container"}>
                {this.renderStatistics()}
                {this.renderSpectatorList()}
                <div className={"theGame"}>
                    {this.renderChooseColorButton()}
                    {this.renderTablePackTop()}
                    {this.renderTheDeck()}
                    <div className={"playersContainer"}>
                        {this.state.playerStatus !== playerStatusConst.SPECTATOR ? this.renderPlayerHand() : null}
                        {this.state.playerStatus !== playerStatusConst.SPECTATOR ? this.state.players.map(this.renderOpponentHand) : null }
                        {this.state.playerStatus === playerStatusConst.SPECTATOR ? this.state.players.map(this.renderForSpectator) : null }
                    </div>
            </div>
                {this.renderEndGamePopUp()}
            </div>
        )
    }

    renderTheDeck() {
        const isDisabled = this.props.username !== this.state.gameStatus.currentPlayer ? "disabled" : "";
        return <img src = {`/resources/deck_.png`} id = {'deck'} className={isDisabled} onClick = {this.takeCardHandler}/>
    }

    renderTablePackTop() {
        const tablePackTopIdArr = this.state.gameStatus.tablePackTop.split('-');
        const attr = tablePackTopIdArr[0];
        const color = tablePackTopIdArr[1];
        return <img src = {`/resources/${color}${attr}.png`} className = {'tablePackTop'} id = {this.state.gameStatus.tablePackTop} key = {this.state.gameStatus.tablePackTop}/>
    }

    renderPlayerHand() {
        const playerIndex = this.state.players.indexOf(this.props.username);
        const isDisabled = this.props.username !== this.state.gameStatus.currentPlayer ? "disabled playerCard" : "playerCard myCard";
        const playerHand = this.state.gameStatus.playersCards[playerIndex];
        const cardsContainer = this.calcCardContainer(this.props.username);

        const cardsDisplay = playerHand.map((cardId,index) => {
            const cardIdArr = cardId.split('-');
            return <img src = {`/resources/${cardIdArr[1]}${cardIdArr[0]}.png`} className={isDisabled} onClick = {this.putCardHandler.bind(this)}  id = {cardId} key={cardId+index}/>;
        });

        return (<div className={cardsContainer}>{cardsDisplay}<h3 className={"userName"}>{this.props.username}</h3> </div>);
    }

    renderOpponentHand(playerName,index) {
        if (playerName !== this.props.username) {
            const playersHand = this.state.gameStatus.playersCards[index];
            const cardsContainer = this.calcCardContainer(playerName);
            const cardsDisplay = playersHand.map((cardId,index) =>
                <img src={'/resources/CardBack.png'} id={cardId} className={"playerCard"} key={cardId}/>);
            return (<div className={cardsContainer}>{cardsDisplay}<div className={"userName"}>{playerName}</div></div>)
        }
        return null;
    }

    renderStatistics() {
        return (
            <div id="statistics-Container">
                <p>Game length: {this.state.gameStatus.currentTimer}</p>
                <p>Current Player: {this.state.gameStatus.currentPlayer}</p>
                {this.state.playerStatus !== playerStatusConst.SPECTATOR ? <p>Average turn time: {this.state.gameStatus.avgTime}</p> : null}
                {this.state.playerStatus !== playerStatusConst.SPECTATOR ? <p>Last card: {this.state.gameStatus.lastCard}</p> : null}
            </div> )
    }

    renderChooseColorButton() {
        if(this.state.gameStatus.choosingColorTime === true && this.state.gameStatus.currentPlayer === this.props.username) {
            return (
                <ColorButton chooseColorHandler={this.chooseColorHandler}/>
            )
        } else {
            return null;
        }
    }

    renderSpectatorList() {
        return(
            <div id = "spectatorList-container">
                <h3>spectators:</h3>
                {this.state.gameStatus.spectators.map((user,index) => <div className={"spectator"} key={index}>{user}</div>)}
            </div>
        )
    }

    renderForSpectator(playerName,index) {
        const playersHand = this.state.gameStatus.playersCards[index];
        const cardsContainer = this.calcCardContainer(playerName);
        const cardsDisplay = playersHand.map((cardId) => {
            const cardIdArr = cardId.split('-');
            return <img src = {`/resources/${cardIdArr[1]}${cardIdArr[0]}.png`} className = {"playerCard"} id = {cardId} key={cardId}/>;
        });
        return (<div className={cardsContainer}>{cardsDisplay}<div className={"userName"}>{playerName}</div></div>)
    }


    renderEndGamePopUp() {
        if(this.state.gameStatus && this.state.isActive === false){
            return (
                <div className = 'animate'>
                    <div className = 'popupContainer endGame'>
                        <h1>Game Summery</h1>
                        <h2>Players Rank</h2>
                        <p>Winner: {this.state.gameSummery.playersRank[0]}</p>
                        {this.state.gameSummery.playersRank.map((player,index)=>(index !== 0 ? <p key={index+1}>{index+1}: {player}</p> : null))}
                        <h2>Statistics</h2>
                        <p>Length: {this.state.gameSummery.totalTime}</p>
                        <p>Turns: {this.state.gameSummery.totalTurns}</p>
                        {this.state.players.map((player,i)=><p>{player} : last card = {this.state.gameSummery.playersLastCard[i]}, avg time = {this.state.gameSummery.playersAvgTime[i]}</p>)}
                    </div>
                </div>)
        } else {
            return null;
        }
    }


//----------------------------------------------------HANDLERS----------------------------------------------------------

    takeCardHandler() {
        if(this.state.isActive === true && this.state.gameStatus.choosingColorTime === false){
            if(this.state.gameStatus.currentPlayer === this.props.username){
                fetch("/games/takeCard", {
                    method: "POST",
                    body: JSON.stringify({gamename: this.props.gamename}),
                    credentials: "include"
                })
                    .then((response) => {
                        if (!response.ok) {
                            this.notificationManager("invalid move",notificationConst.INVALID_MOVE);
                        }
                    });
            } else {
                if(this.state.playerStatus === playerStatusConst.SPECTATOR){
                    this.notificationManager("you're just a spectator man",notificationConst.INVALID_MOVE);
                } else if(this.state.playerStatus === playerStatusConst.FINISHED_CARDS){
                    this.notificationManager("you already finished your cards man",notificationConst.INVALID_MOVE);
                } else {
                    this.notificationManager("not your turn man",notificationConst.INVALID_MOVE);
                }
            }
        }
    }

    putCardHandler(clickedCard) {
        if(this.state.isActive === true){
            if(this.state.gameStatus.currentPlayer === this.props.username){
                const _cardId = clickedCard.target.id;
                fetch("/games/putCard", {
                    method: "POST",
                    body: JSON.stringify({
                        gamename: this.props.gamename,
                        cardId: _cardId
                    }),
                    credentials: "include"
                })
                    .then((response) => {
                        if (!response.ok) {
                            this.notificationManager("invalid move",notificationConst.INVALID_MOVE);
                        }
                    });
            } else {
                this.notificationManager("not your turn man",notificationConst.INVALID_MOVE);
            }
        }
    }

    chooseColorHandler(newColor) {
        return fetch("/games/chooseColor", {
            method: "POST",
            body: JSON.stringify({
                gamename: this.props.gamename,
                newColor: newColor
            }),
            credentials: "include"
        })
            .then(() => {
            });
    }


//--------------------------------------------------GAME-STATUS---------------------------------------------------------

    getGameInfo() {
        return fetch("/games/gameInfo", {
            method: "POST",
            body: JSON.stringify({gamename: this.props.gamename}),
            credentials: "include"
        })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                return response.json();
            })
            .then(gameInfo => {
                const updatedStatusMessage = this.createStatusMessage(gameInfo);
                if(updatedStatusMessage !== this.state.statusMessage){
                    this.notificationManager(updatedStatusMessage,notificationConst.PRE_GAME_STATUS);
                }
                this.setState(() => ({
                    players: gameInfo.players,
                    statusMessage: updatedStatusMessage
                }));
                if(!gameInfo.isActive){
                    this.timeoutId = setTimeout(this.getGameInfo, 200);
                } else {
                    this.initGame();
                }
            })
            .catch(err => {
                throw err
            });
    }

    initGame() {
        return fetch("/games/initGame", {
            method: "POST",
            body: JSON.stringify({
                gamename: this.props.gamename,
                players: this.state.players
            }),
            credentials: "include"
        })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                if(this.state.playerStatus === playerStatusConst.WAITING){
                    this.setState(() => ({playerStatus : playerStatusConst.PLAYING}));
                }
                this.getGameStatus();
            })
            .catch(err => {
                throw err
            });
    }

    getGameStatus() {
        return fetch("/games/gameStatus", {
            method: "POST",
            body: JSON.stringify({
                gamename: this.props.gamename,
                username: this.props.username
            }),
            credentials: "include"
        })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                return response.json();
            })
            .then(updatedGameStatus => {
                let updatedPlayerStatus;

                if(updatedGameStatus.playersRank.includes(this.props.username) && this.state.playerStatus !== playerStatusConst.SPECTATOR){
                    updatedPlayerStatus = playerStatusConst.FINISHED_CARDS;
                } else {
                    updatedPlayerStatus = this.state.playerStatus;
                }

                if (updatedGameStatus.isActive === true) {
                    this.timeoutId = setTimeout(this.getGameStatus, 1000);
                } else {
                    if(this.state.playerStatus !== playerStatusConst.SPECTATOR){
                        updatedPlayerStatus = playerStatusConst.FINISHED_CARDS;
                    }
                    this.getGameSummery();
                }

                this.setState(() => ({
                    isActive: updatedGameStatus.isActive,
                    gameStatus: updatedGameStatus,
                    playerStatus: updatedPlayerStatus
                }));
            })
            .catch(err => {
                throw err
            });
    }
    getGameSummery() {
        console.log("in get gameSummery");
        fetch("/games/gameSummery", {
            method: "POST",
            body: JSON.stringify({gamename: this.props.gamename}),
            credentials: "include"
        })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                return response.json();
            })
            .then(gameSummery => {
                this.setState(() => ({
                    isActive: false,
                    gameSummery: gameSummery
                }));
            })
            .catch(err => {
                throw err
            });
    }

//----------------------------------------------------UTILITIES---------------------------------------------------------

    createStatusMessage(gameInfo) {
        const playersMissing = gameInfo.playersNum - gameInfo.players.length;

        if(gameInfo.isActive === true){
            return "game on!!!";
        } else if(playersMissing === 1 || (playersMissing === 2 && gameInfo.isCompPlay === true)){
            return "waiting for one more player";
        } else {
            return gameInfo.isCompPlay === true ? `waiting for ${playersMissing - 1} players` : `waiting for ${playersMissing} players`;
        }
    }

    calcCardContainer(playerName) {
        let placeOnBoard;
        const playersNum = this.state.players.length;
        const playerIndex = this.state.players.indexOf(playerName);
        if(playersNum === 2){
            placeOnBoard = playerIndex === 0 ? 1 : 3;
        }
        else if(playersNum === 3){
            placeOnBoard = playerIndex === 2 ? 4 : playerIndex + 1;
        }
        else {
            placeOnBoard = playerIndex + 1;
        }
        return `player${placeOnBoard}-container`;
    }

    notificationManager(notification, notificationType) {
        switch (notificationType) {
            case notificationConst.PRE_GAME_STATUS:
                snackbarStatusMessage(notification);
                break;
            case notificationConst.INVALID_MOVE:
                snackbarInvalid(notification);
                break;
        }
    }
}
