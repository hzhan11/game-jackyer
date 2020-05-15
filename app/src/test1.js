import React from 'react'
import { Collapse, Button, Pre } from '@blueprintjs/core'
 
export class Test extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = { 
            url:null,
        };
        this.handleClick = this.handleClick.bind(this);
        this.timerID = null;
    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }
    
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    
    tick() {
        this.setState({
            url: 'http://127.0.0.1:5000/device/screen/'+Date.now().toLocaleString()
        });
    }

    handleClick(){
        if(this.timerID !== null){
            clearInterval(this.timerID);
            this.timerID = null;
        }
        else
            this.timerID = setInterval(
                () => this.tick(),
                100
            );
    }
    
    render() {
        return (
            <div>
                <img src={this.state.url}></img>
                <Button onClick={this.handleClick}>ok</Button>
            </div>
        );
    }
}