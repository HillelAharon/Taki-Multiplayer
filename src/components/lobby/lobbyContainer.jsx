import React from 'react';
import GamesArea from './gamesArea.jsx';
import UserList from './usersList.jsx';
import GameEntryForm from './gameEntryForm.jsx';
import GameContainer from "../gameTable/gameContainer.jsx";
import '../../../Style/LobbyStyle.css';
import {snackbarInvalid} from "../../engine/snackBars/snackBar";
import TakiLogo from '../../../Style/StyleImgs/icon.png'

export default class LobbyContainer extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            showNewGameForm: true,
            watchGame: false,
            joinedGame: false,
            username: props.name,
            currentGamename: ""
        };
    }

    render(){
        if(this.state.joinedGame === false && this.state.watchGame === false){
            return(
                <div className="lobby-container">
                    <img className={"logo"} src={TakiLogo}></img>
                    <button className={"util btn"} id={"logoutBtn"} onClick={this.props.logoutHandler}></button>
                    <UserList />
                    {this.state.showNewGameForm === true ? <GameEntryForm newGameEntryHandler={this.newGameEntryHandler.bind(this)}/>:null}
                    <GamesArea username = {this.state.username}
                               joinGameHandler = {this.joinGameHandler.bind(this)}
                               removeGameHandler = {this.removeGameHandler.bind(this)}
                               watchGameHandler = {this.watchGameHandler.bind(this)}
                    />
                </div>
            )
        } else if(this.state.joinedGame === true){
            return(
                    <GameContainer username = {this.state.username}
                                   gamename = {this.state.currentGamename}
                                   playerStatus = {"waiting"}
                                   leaveGameHandler = {this.leaveGameHandler.bind(this)} />
            )
        } else if(this.state.watchGame === true) {
            return(
                    <GameContainer username = {this.state.username}
                                   gamename = {this.state.currentGamename}
                                   playerStatus = {"spectator"}
                                   leaveGameHandler = {this.leaveGameHandler.bind(this)} />
            )
        }
    }

    newGameEntryHandler(e) {
        e.preventDefault();

        const gamename = e.target.elements.name.value;
        const _playersNum = e.target.elements.playersNum.value;
        const _isCompPlay = document.getElementById("isCompPlay").checked;

        fetch("/games/addGame", {
            method: "POST",
            body: JSON.stringify({gamename: gamename,playersNum: _playersNum, isCompPlay: _isCompPlay }),
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw response;
                }
                this.setState(()=>({showNewGameForm:false}));
            })
            .catch(() => {
                snackbarInvalid("Game name already exist amigo");
            });
        return false;
    }

    joinGameHandler(game) {
        fetch("/games/joinGame", {
            method: "POST",
            body: JSON.stringify({gamename: game}),
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw response;
                } else {
                    this.setState(() => ({joinedGame: true , currentGamename: game}));
                }
            })
            .catch(err => {
                throw err;
            });
    }

    removeGameHandler(game) {
        fetch("/games/removeGame", {
            method: "POST",
            body: JSON.stringify({gamename: game}),
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw response;
                } else {
                    this.setState(()=> ({showNewGameForm: true}));
                }
            })
            .catch(err => {
                throw err;
            });
    }

    watchGameHandler(game) {
        fetch("/games/watchGame", {
            method: "POST",
            body: JSON.stringify({gamename: game}),
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw response;
                } else {
                    this.setState(() => ({watchGame: true , currentGamename: game}));
                }
            })
            .catch(err => {
                throw err;
            });
    }

    leaveGameHandler(game) {
        console.log("in leave game with "+ game);
        fetch("/games/leaveGame", {
            method: "POST",
            body: JSON.stringify({gamename: game}),
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw response;
                } else {
                    if(this.state.joinedGame === true){
                        this.setState(() => ({joinedGame: false , currentGamename: ""}));
                    } else {//watch game
                        this.setState(() => ({watchGame: false , currentGamename: ""}));
                    }
                }
            })
            .catch(err => {
                throw err;
            });
    }
}