import React from 'react';

export default class GameEntryForm extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <form className={"create-game"} onSubmit={this.props.newGameEntryHandler}>
             <div>
                 <h3 className={"addGameTitle"}>Add Game</h3>
                 <input className={"addGameText"} type={"text"} name={"name"} placeholder={"Game name"}/>
             </div>
                <div>
                <label className={"input-w"} htmlFor={"playersNum"}>Participant: </label>
                <select className={"input-s"} name={"playersNum"}>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                </select>
                </div>
                <div>
                <input className={"input-w"} type={"checkbox"} id = {"isCompPlay"} name={"isCompPlay"}></input>
                <label htmlFor={"checkbox"} name={"isCompPlay"}>Computer player</label>
                </div>
                <div>
                    <input
                        type={"submit"}
                        className={"btn"}
                        id={"submitBtn"}
                        value={"Submit"}
                    />
                </div>
            </form>
        );
    }
}