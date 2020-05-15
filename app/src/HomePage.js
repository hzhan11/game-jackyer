import { Alignment, Button, Card, Label, Elevation, Navbar, Tab, Tabs, ControlGroup, Divider  } from "@blueprintjs/core";
import React from 'react';
import { ImageEditorPanel } from "./ImageEditor"
import { ScreenRecorderPanel } from "./ScreenRecord"
import { ALIGN_LEFT } from "@blueprintjs/core/lib/esm/common/classes";
import { asyncStartDeviceScreenMirror } from "./dataSource";

export class HomePage extends React.Component {
    
    constructor(props) {

        super(props);
        this.state = { 
            panel: <ImageEditorPanel/>,
            panelText: 'Editor'
        };
        this.handlePanelSelected=this.handlePanelSelected.bind(this);
    }

    handlePanelSelected(e){
        switch(e.currentTarget.id){
            case 'EditorButton':
                this.setState({panel:<ImageEditorPanel/>, panelText:'Label'});
                break;
            case 'RecordButton':
                this.setState({panel:<ScreenRecorderPanel/>, panelText:'Record'});
                break;
        }
    }

    render() {
        return (
            <ControlGroup vertical={true}>
                <Card className="bp3-dark" style={{'padding':10}}>
                    <ControlGroup vertical={false}>
                        <Button className="bp3-minimal" style={{width:200}}>GameJackyer - {this.state.panelText} </Button>
                        <Divider></Divider>
                        <Button className="bp3-minimal" icon="annotation" id="EditorButton" text='Label' onClick={this.handlePanelSelected} />
                        <Button className="bp3-minimal" icon="record" id="RecordButton" text='Record'  onClick={this.handlePanelSelected} />
                        <Button className="bp3-minimal" icon="play" id="PlayButton" text='Train'  onClick={this.handlePanelSelected} />
                        <Button className="bp3-minimal" icon="mobile-phone" id="DeviceButton" text='Device' onClick={this.handlePanelSelected} />
                    </ControlGroup>
                </Card>
                {this.state.panel}
            </ControlGroup>
        );
    }
}
