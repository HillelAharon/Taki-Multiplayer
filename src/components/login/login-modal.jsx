import React from 'react';
import '../../../Style/LoginStyle.css';
import {snackbarInvalid} from "../../engine/snackBars/snackBar";

export default class LoginModal extends React.Component {
    constructor(args) {
        super(...args);

        this.state ={
            errMessage: ""
        }

        this.handleLogin = this.handleLogin.bind(this);        
    }

    render() {
        return (
            <div className="login-page-wrapper">
                <h1 className={"welcomeTitle"}>Welcome to Taki Online!</h1>
                <h3 className={"welcomSubTitle"}>Please register to enter the game hall</h3>
                <form onSubmit={this.handleLogin}>
                    <label className="username-label" id={"usernameLabel"} htmlFor="userName"> Username: </label>
                    <input className="username-input" name="userName"/>
                    <input className="btn" id={"submit-btn"} type="submit" value="Login"/>
                </form>
                {this.renderErrorMessage()}
            </div>
        );
    }


    renderErrorMessage() {
        if (this.state.errMessage) {
            return (
                <div className="login-error-message">
                    {this.state.errMessage}
                </div>
            );
        }
        return null;
    }

    handleLogin(e) {
        e.preventDefault();
        const userName = e.target.elements.userName.value;
        fetch('/users/addUser', {method:'POST', body: userName, credentials: 'include'})
        .then(response=> {            
            if (response.ok){
                //this.setState(()=> ({errMessage: ""}));
                this.props.loginSuccessHandler();
            } else {
                if (response.status === 403) {
                    snackbarInvalid("User name already exist amigo");
                    //this.setState(()=> ({errMessage: "User name already exist, please try another one"}));
                }
                this.props.loginErrorHandler();
            }
        });
        return false;
    }    
}