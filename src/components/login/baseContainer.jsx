import React from 'react';
import LoginModal from './login-modal.jsx';
import LobbyContainer from '../lobby/lobbyContainer.jsx';



export default class BaseContainer extends React.Component {
    constructor(args) {
        super(...args);
        this.state = {
            showLogin: true,
            currentUser: {
                name: ''
            }
        };
        this.handleSuccessfulLogin = this.handleSuccessfulLogin.bind(this);
        this.handleLoginError = this.handleLoginError.bind(this);
        this.fetchUserInfo = this.fetchUserInfo.bind(this);
        this.logoutHandler= this.logoutHandler.bind(this);
        this.getUserName();
    }

    render() {        
        if (this.state.showLogin || this.state.currentUser.name === '') {
            return (<LoginModal loginSuccessHandler={this.handleSuccessfulLogin} loginErrorHandler={this.handleLoginError}/>)
        } else {
            return this.renderLobby();
        }

    }

    renderLobby() {
        return (
            <div className="lobby-base-container">
                <LobbyContainer name={this.state.currentUser.name} logoutHandler={this.logoutHandler}/>
            </div>
        )
    }


    handleSuccessfulLogin() {
        this.setState(()=>({showLogin:false}), this.getUserName);
    }

    handleLoginError() {
        console.error('login failed');
        this.setState(()=>({showLogin:true}));
    }

    getUserName() {
        this.fetchUserInfo()
        .then(userInfo => {
            this.setState(()=>({currentUser:userInfo, showLogin: false}));
        })
        .catch(err=>{            
            if (err.status === 401) {
                this.setState(()=>({showLogin: true}));
            } else {
                throw err;
            }
        });
    }

    fetchUserInfo() {        
        return fetch('/users',{method: 'GET', credentials: 'include'})
        .then(response => {            
            if (!response.ok){
                throw response;
            }
            return response.json();
        });
    }

    logoutHandler() {
        fetch('/users/logout', {method: 'GET', credentials: 'include'})
        .then(response => {
            if (!response.ok) {
                console.log(`failed to logout user ${this.state.currentUser.name} `, response);                
            }
            this.setState(()=>({currentUser: {name:''}, showLogin: true}));
        })
    }

}

