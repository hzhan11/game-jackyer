import { Tag, Alignment, ControlGroup, Divider, Colors, InputGroup, Label, Button, Card, Icon } from "@blueprintjs/core";
import React from 'react';
import {asyncGetImageList, asyncGetImageListByBBox, asyncGetImageListByScene, EXPRESS_HOST} from './dataSource';
import emitter from "./event"

export class ImageList extends React.Component {
    
    constructor(props) {
        super(props);
        this.win_size = 9;
        this.selected_index_offset = 4;
        this.state = {
            data: props.data,
            selectedUuid: null,
            startIndex: 0,
        };
        this.handleLoadClick = this.handleLoadClick.bind(this);
        this.postGetImageList = this.postGetImageList.bind(this);
    }

    componentDidMount(){
        this.eventEmitter = emitter.addListener("dataUpdated",()=>{
            this.handleLoadClick();
        });
        this.handleLoadClick();
    }

    componentWillUnmount(){
        emitter.removeListener("dataUpdated", ()=>{;});
    }

    handleCheck(selectedUuid) {
        var selectedIndex = this.getIndexOfUuid(selectedUuid)
        let offset = selectedIndex - (this.state.startIndex + this.selected_index_offset);
        let newstartIndex = this.state.startIndex + offset;
        if(newstartIndex < 0)
            newstartIndex = 0;
        if(newstartIndex > this.state.data.images.length - 1){
            newstartIndex = this.state.data.images.length - 1;
        }
        this.setState({startIndex:newstartIndex, selectedUuid: selectedUuid});
        this.notifiySelection(selectedUuid);
    }
    
    getIndexOfUuid(selectedUuid){
        let selectedIndex = this.state.data.images.findIndex(function (x) {
            return x.uuid === selectedUuid;
        });
        return selectedIndex;
    }
    
    postGetImageList(data){
        this.setState({data:data});
        if(this.state.selectedUuid !== null){
            this.handleCheck(this.state.selectedUuid);
        }
        else{
            if(data.images[0] !== undefined)
                this.handleCheck(data.images[0].uuid);
        }
    }

    handleLoadClick() {
        var text = document.getElementById("text-search").value;
        if(text===''){
            asyncGetImageList((data)=>this.postGetImageList(data));
        }
        else{
            var value = text.split('=');
            if(value[0]==='b'){
                asyncGetImageListByBBox((data)=>this.postGetImageList(data),value[1]);
            }
            else if(value[0]==='s'){
                asyncGetImageListByScene((data)=>this.postGetImageList(data),value[1]);
            }
            else if(value[0]==='g'){
                let new_index = parseInt(value[1])-1;
                if(new_index < 0 || new_index > this.state.data.images.length-1)
                    return;
                let lastSelectedUuid = this.state.data.images[new_index].uuid;
                this.handleCheck(lastSelectedUuid);
            }
            else{
                ;
            }
        }
    }

    notifiySelection(uuid){
        emitter.emit("imageSelected",uuid, this.getIndexOfUuid(uuid));
    }

    handleArrowClick(dir){
        let index = this.getIndexOfUuid(this.state.selectedUuid);
        if(dir === 'left'){
            index -= this.win_size;
        }
        else if(dir === 'left2'){
            index -= this.win_size * 5;
        }
        else if(dir === 'right'){
            index += this.win_size;
        }
        else if(dir === 'right2'){
            index += this.win_size * 5;
        }
        else
            ;
        if(index<0)
            index = 0;
        if(index > this.state.data.images.length-1)
            index = this.state.data.images.length-1;
        let lastSelectedUuid = this.state.data.images[index].uuid;
        this.handleCheck(lastSelectedUuid);
    }

    render() {
        if (this.state.data === null)
            return (
            <ControlGroup fill={true} vertical={true} align={Alignment.LEFT}>
                <ControlGroup vertical={false} align={Alignment.LEFT}>
                    <InputGroup style={{width:190, fontSize:11}} leftIcon='search' id="text-search" type='search' placeholder="Search..." />
                    &nbsp;
                    <Button icon='folder-open' style={{width:20}}></Button>
                </ControlGroup>
                <Card style={{height:595}}></Card>
                <Label align={Alignment.CENTER}>&lt;&lt;   &lt;   0 | 0   &gt;   &gt;&gt;	 </Label>
            </ControlGroup>
        );
        const images = this.state.data.images;
        if (this.state.selectedUuid === null && images.length > 0) {
            this.setState({ selectedUuid: images[0].uuid });
            this.notifiySelection(images[0].uuid);
        }
        const images_display_win = images.slice(this.state.startIndex, this.state.startIndex + this.win_size);
        const items = images_display_win.map((img, index) =>
            <>
                <ControlGroup>
                    <div style={{ color: Colors.WHITE }} key={img.uuid} onClick={() => this.handleCheck(img.uuid)}>
                        <div style={{ float: 'left' }}>
                            {this.state.selectedUuid === img.uuid ? 
                                (<img src={EXPRESS_HOST+img.url} width='200' height='130' alt=''></img>) 
                                : (<img src={EXPRESS_HOST+img.url} width='80' height='48' alt=''></img>)}
                        </div>
                        <div style={{ float: 'left', margin:5 }}>
                            {this.state.selectedUuid !== img.uuid ? 
                                (<div style={{margin:5, float: 'left', color: Colors.GRAY3 }}>
                                    <div>Number = {this.state.startIndex+index+1}</div>
                                    <div>[boxes={img.bboxs.length}, scenes={img.scenes.length}]</div>
                                </div>) 
                                :<div />}
                        </div>
                    </div>
                </ControlGroup>
                <Divider />
            </>
        );
        return (
        <ControlGroup fill={true} vertical={true} align={Alignment.LEFT}>
            <ControlGroup vertical={false} align={Alignment.LEFT}>
                <InputGroup style={{width:190}} leftIcon='search' id="text-search" type='search' placeholder="Search..." />
                &nbsp;
                <Button icon='folder-open' style={{width:20}} onClick={this.handleLoadClick}></Button>
            </ControlGroup>
            <br></br>
            <ControlGroup vertical={true} style={{height:620}} >
                <Divider />
                {items}
            </ControlGroup>
            <br></br>
            <ControlGroup align={Alignment.CENTER} fill={true} vertical={false} >
                <Button minimal={true} onClick={()=>this.handleArrowClick('left2')} icon="double-chevron-left"/>
                <Button minimal={true} onClick={()=>this.handleArrowClick('left')} icon="chevron-left"/>
                <Tag minimal={true}>{this.getIndexOfUuid(this.state.selectedUuid)+1} | {this.state.data.images.length}</Tag>
                <Button minimal={true} onClick={()=>this.handleArrowClick('right')} icon="chevron-right"/>
                <Button minimal={true} onClick={()=>this.handleArrowClick('right2')} icon="double-chevron-right"/>
            </ControlGroup>
        </ControlGroup>);
    }
}
