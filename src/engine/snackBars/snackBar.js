import React from 'react'
import '../../../Style/snackbars.css';

function snackbarInvalid(reason) {
    if(!document.getElementById("snackbar")){
        var snackbarElement = document.createElement("div");
        snackbarElement.id = "snackbar";
        document.getElementById("root").appendChild(snackbarElement);
    }
    var snackbar = document.getElementById("snackbar");
    snackbar.style.backgroundColor = "red";
    snackbar.innerHTML = reason;
    snackbar.className = "show";
    setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 1500);

}

function snackbarStatusMessage(gameStatus) {
    if(!document.getElementById("snackbar")){
        var snackbarElement = document.createElement("div");
        snackbarElement.id = "snackbar";
        document.getElementById("root").appendChild(snackbarElement);
    }
    var snackbar = document.getElementById("snackbar");
    snackbar.style.backgroundColor = "blue";
    snackbar.innerHTML = gameStatus;
    snackbar.className = "show";
    setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
}

// export {snackbarStatusMessage,snackbarInvalid,snackbarNewColor,snackbarWhosTurn} ;
export {snackbarStatusMessage,snackbarInvalid} ;

