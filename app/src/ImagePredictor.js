import {Tag, Alignment, Button, Card, Label, Elevation, FormGroup, Tab, Tabs, ControlGroup  } from "@blueprintjs/core";
import React from 'react';
import {asyncGetImageScenePredictionByUuid, helloworld,asyncGetImageList} from './dataSource'
import emitter from "./event"
import Chart from "react-apexcharts";

export class ImagePredictorPanel extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = { 
            data: {
                labels:[]
            },
        };
        this.handleImageDataReceived = this.handleImageDataReceived.bind(this);
    
    }

    handleImageDataReceived(data){
        this.setState({data:data});
    }

    componentDidMount(){
        this.eventEmitter = emitter.addListener("imageSelected",(selectedImageUuid, selectedImageIndex)=>{
            asyncGetImageScenePredictionByUuid(this.handleImageDataReceived,selectedImageUuid);
        });
        this.eventEmitter2 = emitter.addListener("screenLoaded",()=>{
            asyncGetImageScenePredictionByUuid(this.handleImageDataReceived,"null");
        });
    }

    componentWillUnmount(){
        emitter.removeListener("imageSelected", ()=>{;});
        emitter.removeListener("screenLoaded", ()=>{;});
    }

    render() {
        const numbers = this.state.data.labels;
        const listItems = numbers.map((number) => {
            let p = parseFloat(number.possible);
            if(p > 0.8)
                return(
                    <Tag className='bp3-intent-warning' style={{padding:5, margin:2}} minimal={false}>{number.scene}:{number.possible}</Tag>
                );
            else
                return(
                    <Tag style={{padding:5, margin:2}} minimal={true}>{number.scene}:{number.possible}</Tag>
                );
        });
        return (
            <ControlGroup vertical={false}>
                <Tag style={{padding:5, margin:2}} minimal={false}>Scene Prediction:</Tag> {listItems}
            </ControlGroup>
        );
        
    }
}
