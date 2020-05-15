import { Tag, Button, Card, ControlGroup, Elevation, Text, Classes, Code  } from "@blueprintjs/core";
import React from 'react';
import {EXPRESS_HOST, asyncGetDeviceConfig, asyncDeviceInput, asyncStartDeviceScreenRecord, 
asyncStopDeviceScreenRecord, asyncStartDeviceScreenMirror, asyncStopDeviceScreenMirror, asyncDryrunStep} from "./dataSource";

import {ImagePredictorPanel} from "./ImagePredictor";
import emitter from "./event";

import ScrollToBottom from "react-scroll-to-bottom";
import { css } from 'glamor';

export class ScreenRecorderPanel extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = { 
            startTime: null,
            buttonText: ' ',
            mouseX:-1,
            mouseY:-1,
            device:null,
            url_post:"",
            mesgs:['start']
        };
        this.handleRecordStart = this.handleRecordStart.bind(this);
        this.handleDryrunStart = this.handleDryrunStart.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this); 
        this.postDryrun = this.postDryrun.bind(this);
        asyncGetDeviceConfig((data)=>this.setState({device:data.devices[0]}))
    }

    componentDidMount(){
        asyncStartDeviceScreenMirror(()=>{});
        this.screenTimerID = setInterval(() => this.screen(),750);
    }

    componentWillUnmount(){
        if(this.state.startTime !== null){
            this.handleRecordStart(null);
        }
        asyncStopDeviceScreenMirror(()=>{});
        clearInterval(this.screenTimerID);
    }

    screen(){
        this.setState({url_post : Date.now().toLocaleString()});
        emitter.emit("screenLoaded");
    }

    handleRecordStart(e){
        if(this.state.startTime === null){
            this.timerID = setInterval(
                () => this.tick_record(e),
                1000
            );
            this.setState({startTime: (new Date()).getTime()});
            asyncStartDeviceScreenRecord(()=>{});
        }
        else{
            asyncStopDeviceScreenRecord(()=>{})
            clearInterval(this.timerID);
            this.setState({startTime:null});
        }
    }

    handleDryrunStart(e){
        if(this.state.startTime === null){
            this.timerID = setInterval(
                () => this.tick_dryrun(e),
                1000
            );
            this.setState({startTime: (new Date()).getTime()});
        }
        else{
            clearInterval(this.timerID);
            this.setState({startTime:null});
        }
    }

    postDryrun(data){
        let delta = parseInt((new Date().getTime() - this.state.startTime) / 1000).toString();
        let old = this.state.mesgs.slice();
        old.push(delta + " : " + data['mesg']);
        this.setState({mesgs:old});
    }

    tick_dryrun(e){
        let delta = parseInt((new Date().getTime() - this.state.startTime) / 1000).toString();
        let buttonText = delta + 's elapsed';
        this.setState({buttonText:buttonText});
        asyncDryrunStep(this.postDryrun);
    }

    tick_record(e){
        let delta = parseInt((new Date().getTime() - this.state.startTime) / 1000).toString();
        let buttonText = delta + 's elapsed';
        this.setState({buttonText:buttonText});
    }

    handleMouseDown(e){
        let x = parseInt((e.clientX - e.target.x) * this.state.device.resolution.width / 800)
        let y = parseInt((e.clientY - e.target.y) * this.state.device.resolution.height / 480)
        asyncDeviceInput(function(){},{'type':'tap', 'param': x.toString()+","+y.toString()});
        this.setState({mouseX:x, mouseY:y})
    }

    render() {
        const ROOT_CSS = css({
            height: 700,
            width: 400
        });
        const mesg_items = this.state.mesgs.map((mesg) =>
            <div>
                <p>{mesg}</p>
            </div>
        );
        return (
            <ControlGroup>
                <ControlGroup vertical={true}>
                    <Card className="bp3-dark" interactive={true} elevation={Elevation.ONE}>
                        <img id='device-screen' style={{ width: 800, height: 480 }} src={EXPRESS_HOST+'device/screen/'+this.state.url_post} onMouseDown={this.handleMouseDown}/>
                        <div style={{height:17}}></div>
                        <ControlGroup>
                            <Button id='start-button' icon={this.state.startTime===null?'record':'stop'} 
                                text={this.state.startTime===null?'Start Record':'Stop Record'} onClick={this.handleRecordStart}></Button>
                            &nbsp;&nbsp;
                            <Button id='dryrun-button' icon={this.state.startTime===null?'record':'stop'}
                                text={this.state.startTime===null?'Start Dryrun':'Stop Dryrun'} onClick={this.handleDryrunStart}></Button>
                            <Button className='bp3-disabled' style={{ width: 130 }}>{this.state.buttonText}</Button>
                            &nbsp;&nbsp;
                            <Button className='bp3-disabled' style={{ width: 410 }}>tap x,y=[{this.state.mouseX},{this.state.mouseY}]</Button>
                        </ControlGroup>
                    </Card>
                    <Card className="bp3-dark" interactive={true} elevation={Elevation.ONE}>
                        <div style={{ height: 130 }}>
                            <ImagePredictorPanel></ImagePredictorPanel>
                        </div>
                    </Card>
                </ControlGroup>
                <Card style={{height: 740, width: 585 }} className="bp3-dark" interactive={true} elevation={Elevation.ONE}>
                    <ScrollToBottom className={ ROOT_CSS }>
                        {mesg_items}
                    </ScrollToBottom>
                </Card>
            </ControlGroup>
        );
    }
}