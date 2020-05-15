import { Alignment, Button, Card, Label, Elevation, FormGroup, Tab, Tabs, ControlGroup  } from "@blueprintjs/core";
import React from 'react';
import { ImageList } from "./ImageList";
import { ImageBBEditor } from "./ImageBBEditor";
import { ImageLableStatForm} from "./ImageLableStat"; 
import { ImagePredictorPanel} from "./ImagePredictor";

export class ImageEditorPanel extends React.Component {
    
    constructor(props) {

        super(props);
        this.state = { 
            data: null,
        };
        
    }

    render() {
        return (
            <ControlGroup>
                <Card style={{ height: 750, width: 260 }} className="bp3-dark" interactive={true} elevation={Elevation.ONE}>
                    <ImageList data={this.state.data}/>
                </Card>
                <ControlGroup style={{ width: 840 }} vertical={true}>
                    <Card style={{ height: 605}} className="bp3-dark" interactive={true} elevation={Elevation.ONE}>
                        <ImageBBEditor />
                    </Card>
                    <Card className="bp3-dark" interactive={true} elevation={Elevation.ONE}>
                        <div style={{ height: 106 }}>
                            <ImagePredictorPanel/>
                        </div>
                    </Card>
                </ControlGroup>
                <Card style={{ height: 750, width: 326  }} className="bp3-dark" interactive={true} elevation={Elevation.ONE}>
                    <ImageLableStatForm></ImageLableStatForm>
                </Card>
            </ControlGroup>
        );
    }
}
