import React from "react";

export default class ColorButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    handleClickForColorButton(buttonId) {
        console.log(buttonId);
        this.state.choosenColor = buttonId;
        this.setState({
            choosenColor: this.state.choosenColor
        });

        this.props.chooseColorHandler(buttonId);
    }

    renderButtons() {
        return (
            <div id = 'chooseColor-container'>
                <img src={'/resources/blue_cube.png'} className='blueColorButton' id='Blue' onClick={() => { this.handleClickForColorButton('Blue'); }} />
                <img src={'/resources/green_cube.png'} className='greenColorButton' id='Green' onClick={() => { this.handleClickForColorButton('Green'); }} />
                <img src={'/resources/yellow_cube.png'} className='yellowColorButton' id='Yellow' onClick={() => { this.handleClickForColorButton('Yellow'); }} />
                <img src={'/resources/red_cube.png'} className='redColorButton' id='Red' onClick={() => { this.handleClickForColorButton('Red'); }} />
            </div>
        )
    }

    //
    // renderButtons() {
    //     return (
    //         <div id = 'chooseColor-container'>
    //             <img src={'/resources/blue_cube.png'} className='blueColorButton' id='Blue' onClick={() => {this.props.chooseColorHandler.bind(this) }} />
    //             <img src={'/resources/green_cube.png'} className='greenColorButton' id='Green' onClick={() => { this.props.chooseColorHandler.bind(this)}} />
    //             <img src={'/resources/yellow_cube.png'} className='yellowColorButton' id='Yellow' onClick={() => { this.props.chooseColorHandler.bind(this)}} />
    //             <img src={'/resources/red_cube.png'} className='redColorButton' id='Red' onClick={() => {this.props.chooseColorHandler.bind(this)}} />
    //         </div>
    //     )
    // }
    //

    render() {
        return (
            <div>
                {this.renderButtons()}
            </div>
        )
    }
}
