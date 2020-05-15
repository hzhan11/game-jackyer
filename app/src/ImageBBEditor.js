import { TagInput, InputGroup, Alignment, Divider, Tag, Button, ControlGroup,Switch,Intent} from "@blueprintjs/core";
import React from 'react';
import ReactDOM from 'react-dom';
import {asyncGetImageByUuid, asyncUpdateImage,asyncUpdateImageScenes,EXPRESS_HOST, asyncDeleteImages} from './dataSource';
import emitter from "./event"
import { AppToaster } from "./toast";
import { KeyBind } from "./Hotkey";
import { ELEVATION_2 } from "@blueprintjs/core/lib/esm/common/classes";

class BasePanel extends React.Component {
    constructor(props) {
        super(props);
        this.el = document.createElement('div');
    }

    componentDidMount() {
        document.getElementById(this.props.root).appendChild(this.el);
    }

    componentWillUnmount() {
        document.getElementById(this.props.root).removeChild(this.el);
    }

    render() {
        return ReactDOM.createPortal(
            this.props.children,
            this.el,
        );
    }
}

class FloatElement extends React.Component {

    constructor(props){
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(){
        this.props.select(this.props.id);
    }

    render() {
        return (
            <div style={this.props.isOpen?this.props.style:{width:0,height:0}} onClick={this.handleClick}>
                {this.props.name}
            </div>
        );
    }
}

export class ImageBBEditor extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            currentImage: 
            {
                'uuid':null, 
                'url':'', 
                'bboxs':[],
                'scenes':[]
            },
            //for bbox editing
            baseXForInternal:-1, 
            baseYForInternal:-1,
            baseXForDrawing:-1, 
            baseYForDrawing:-1,
            offsetX:-1,
            offsetY:-1, 
            startOffsetX:-1,
            startOffsetY:-1, 
            selecting:false,
            panelSelected:false,
            selectedBBox:null,
            currentWantingNameforBBox:null,
            //for scenes
            currentImageIndex:-1,
            startTagImageIndex:-1,
            endTagImageIndex:-1,
            startTagImageId:null,
            endTagImageId:null,
            //others
            autoUpdate:true,
        };
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.panelSelected = this.panelSelected.bind(this);
        this.handleBBoxNameClick = this.handleBBoxNameClick.bind(this);
        this.handleApplyBBoxNameToAllClick = this.handleApplyBBoxNameToAllClick.bind(this);
        this.handleRemoveSelectedBBoxClick = this.handleRemoveSelectedBBoxClick.bind(this);
        this.handleClearAllBBoxClick = this.handleClearAllBBoxClick.bind(this);
        this.handleSaveCurrentBBox = this.handleSaveCurrentBBox.bind(this);

        this.handleImageDataReceived = this.handleImageDataReceived.bind(this);
        this.handleImageDataUpdated = this.handleImageDataUpdated.bind(this);

        this.handleMouseLeave = this.handleMouseLeave.bind(this);

        this.handleImageStartSelected = this.handleImageStartSelected.bind(this);
        this.handleImageEndSelected = this.handleImageEndSelected.bind(this)
        this.applySenceToAll = this.applySenceToAll.bind(this);

        this.updateModeChanged = this.updateModeChanged.bind(this);
        this.handleImageDelete = this.handleImageDelete.bind(this);
    }

    handleImageDataReceived(data){
        this.setState({currentImage:data});
    }

    componentDidMount(){
        this.eventEmitter = emitter.addListener("imageSelected",(selectedImageUuid, selectedImageIndex)=>{
            asyncGetImageByUuid(this.handleImageDataReceived, selectedImageUuid)
            
            var base = document.getElementById('screen-pic');
            this.setState({
                baseXForInternal:base.x, 
                baseYForInternal:base.y,
                baseXForDrawing:base.offsetLeft,
                baseYForDrawing:base.offsetTop,
                selectedImageIndex: selectedImageIndex
            });
        });
    }

    componentWillUnmount(){
        emitter.removeListener("imageSelected", ()=>{;});
    }

    handleMouseMove(e){
        if(this.state.panelSelected){
            this.setState({panelSelected:false, selecting:false});
            return;
        }
        let offsetX = e.pageX - this.state.baseXForInternal;
        let offsetY = e.pageY - this.state.baseYForInternal;
        if(offsetX < 0 || offsetX > 800 || offsetY < 0 || offsetY > 480){
            return;
        }
        this.setState({offsetX:offsetX, offsetY:offsetY});
    }

    handleClick(e){
        if(this.state.panelSelected){
            this.setState({panelSelected:false, selecting:false});
            return;
        }
        if(this.state.selecting === false){
            this.setState({startOffsetX:this.state.offsetX, startOffsetY:this.state.offsetY, selecting: true});
            return;
        }
        else{
            if(Math.abs(this.state.startOffsetX-this.state.offsetX)>20 && Math.abs(this.state.startOffsetY-this.state.offsetY)>20){
                const bboxs = this.newBBoxCreate(this.state.startOffsetX, this.state.startOffsetY, this.state.offsetX, this.state.offsetY);
                const newbbid = bboxs[bboxs.length-1].id;
                this.setState({
                    startOffsetX:-1,
                    startOffsetY:-1,
                    selecting:false,
                    selectedBBox:newbbid,
                    currentImage:{
                        ...this.state.currentImage,
                        bboxs:bboxs
                    }
                })
            }
        }
    }

    newBBoxCreate(x1, y1, x2, y2){
        const top = (y1 < y2 ? y1 : y2);
        const left = (x1 < x2 ? x1 : x2);
        const width = Math.abs(x1-x2);
        const height = Math.abs(y1-y2);
        var newBBox = 
        {
            id: 'bbox-'+Date.now().toString(),
            name: document.getElementById("input-new").value,
            rect:{
                top: top,
                left: left,
                width: width,
                height: height
            }
        };
        var bboxs = this.state.currentImage.bboxs.slice();
        return bboxs.concat(newBBox);
    }

    getBBoxById(id){
        var bbox = this.state.currentImage.bboxs.find(bb => bb.id === id);
        if(bbox === undefined)
            bbox = null;
        return bbox;
    }

    panelSelected(id){
        this.setState({panelSelected:true, selecting:false, selectedBBox:id});
    }

    handleBBoxNameClick(){
        if(this.state.selectedBBox !== null){
            var bboxs = this.state.currentImage.bboxs.slice();
            for (let index = 0; index < bboxs.length; index++) {
                if(bboxs[index].id === this.state.selectedBBox){
                    bboxs[index].name = document.getElementById("input-new").value;
                    //if(bboxs[index].name === "")
                    //    bboxs[index].name = "undefined";
                    break;
                }
            }
            this.setState({
                currentImage:{
                    ...this.state.currentImage,
                    bboxs:bboxs
                }
            });
        }
    }

    handleApplyBBoxNameToAllClick(){
        if(this.state.selectedBBox !== null){
            var bboxs = this.state.currentImage.bboxs.slice();
            for (let index = 0; index < bboxs.length; index++) {
                bboxs[index].name = document.getElementById("input-new").value;
                //if(bboxs[index].name === "")
                //        bboxs[index].name = "undefined";
            }
            this.setState({
                currentImage:{
                    ...this.state.currentImage,
                    bboxs:bboxs
                }
            });
        }
    }

    handleRemoveSelectedBBoxClick(){
        if(this.state.selectedBBox !== null){
            var bboxs = this.state.currentImage.bboxs.slice();
            var index = bboxs.indexOf(this.getBBoxById(this.state.selectedBBox));
            bboxs.splice(index,1);
            if(bboxs.length !== 0){
                var lastBBoxId = bboxs[bboxs.length-1].id;
                this.setState({
                    selectedBBox:lastBBoxId,
                    currentImage:{
                        ...this.state.currentImage,
                        bboxs:bboxs
                    }
                });
            }
            else{
                this.setState({
                    selectedBBox:null,
                    currentImage:{
                        ...this.state.currentImage,
                        bboxs:bboxs
                    }
                });
            }
        }
    }

    handleClearAllBBoxClick(){
        this.setState({
            selectedBBox:null,
            currentImage:{
                ...this.state.currentImage,
                bboxs:[]
            }
        });
    }

    handleImageDataUpdated(result){
        AppToaster.show({"message":"image updated"});
    }

    handleSaveCurrentBBox(){
        if(this.state.currentImage.uuid === null){
            return;
        }
        var image = this.state.currentImage;
        image.bboxs.forEach(bbox => {
            if(bbox.name === ""){
                bbox.name = "undefined";
            }
        });
        asyncUpdateImage(this.handleImageDataUpdated,image);
        emitter.emit("dataUpdated");
    }

    handleMouseLeave(){
        if(this.state.autoUpdate)
            this.handleSaveCurrentBBox();
    }

    handleImageStartSelected(){
        let sti = this.state.selectedImageIndex;
        if(this.state.endTagImageIndex!==-1 && sti > this.state.endTagImageIndex){
            AppToaster.show({
                message:"from image index should be no bigger than to index",
                icon: "warning-sign",
                intent: Intent.DANGER,
            });
        }
        let id = this.state.currentImage._id;
        this.setState({
            startTagImageIndex: sti,
            startTagImageId: id
        });
    }

    handleImageEndSelected(){
        let sti = this.state.selectedImageIndex;
        if(this.state.startTagImageIndex !==-1 && sti < this.state.startTagImageIndex){
            AppToaster.show({
                message:"from image index should be no bigger than to index",
                icon: "warning-sign",
                intent: Intent.DANGER,
            });
        }
        let id = this.state.currentImage._id;
        this.setState({
            endTagImageIndex: sti,
            endTagImageId: id
        });
    }

    dataUpdated(res){
        emitter.emit("dataUpdated");
    }

    applySenceToAll(){
        let labels = this.state.currentImage.scenes;
        let start = this.state.startTagImageId;
        let end = this.state.endTagImageId;
        asyncUpdateImageScenes((res)=>this.dataUpdated(res), start, end, labels);
    }

    updateModeChanged(e){
        this.setState({autoUpdate:e.target.checked});
    }

    handleImageDelete(){
        let start = this.state.startTagImageId;
        let end = this.state.endTagImageId;
        asyncDeleteImages((res)=>this.dataUpdated(res), start, end);
    }

    render() {

        //1. handle bbox editing
        const BBoxList = this.state.currentImage.bboxs.map((bbox, step) => {
            var bgcolor = 'rgba(5, 150, 66, 0.5)';
            if(this.state.selectedBBox === bbox.id)
                bgcolor = 'rgba(49, 145, 49, 0.8)';

            const bboxstyle = {
                backgroundColor: bgcolor,
                position: 'fixed',
                border: 1,
                borderStyle: 'dotted',
                height: bbox.rect.height,
                width: bbox.rect.width,
                top: bbox.rect.top + this.state.baseYForDrawing,
                left: bbox.rect.left + this.state.baseXForDrawing,
                fontSize:10,
                color:'rgb(5, 7, 5)'
            };
            return (
                <FloatElement key={bbox.id} id={bbox.id} name={(step+1).toString()+'.'+bbox.name} style={bboxstyle} 
                    isOpen={true} select={this.panelSelected}/>
            );
        });

        const realLeft = (this.state.offsetX < this.state.startOffsetX ? this.state.offsetX : this.state.startOffsetX) + this.state.baseXForDrawing;
        const realTop = (this.state.offsetY < this.state.startOffsetY ? this.state.offsetY : this.state.startOffsetY) + this.state.baseYForDrawing;
        const height = Math.abs(this.state.offsetY-this.state.startOffsetY);
        const width = Math.abs(this.state.offsetX-this.state.startOffsetX);
        
        const drawingBoxStyle = {
            backgroundColor: 'rgba(24, 73, 9, 0.5)',
            position: 'fixed',
            height: height,
            width: width,
            top: realTop,
            left: realLeft
        };

        if(this.state.selectedBBox !== null){
            var bboxname = "";
            if(this.getBBoxById(this.state.selectedBBox) !== null)
                bboxname = this.getBBoxById(this.state.selectedBBox).name
            document.getElementById('input-new').value = bboxname;
        }

        //2. handle sences editing
        const clearButton = (
            <Button
                icon={this.state.currentImage.scenes === undefined || this.state.currentImage.scenes.length ===0 ?  "refresh": "cross"}
                minimal={true} onClick={()=>this.setState({
                    currentImage:{
                        ...this.state.currentImage,
                        scenes:[]
                    }
                })}
            />
        );

        return (
            <div onMouseLeave={this.handleMouseLeave}>
                <div id='base-panel' onClick={this.handleClick} onMouseMove={this.handleMouseMove}>
                    <img id='screen-pic' width='800' height='480' alt='' src={EXPRESS_HOST+this.state.currentImage.url} />
                    <BasePanel root='modal-root'>
                        <FloatElement key='selectin' style={drawingBoxStyle} isOpen={this.state.selecting}/>
                        {BBoxList}
                    </BasePanel>
                </div>
                <div style={{'height':9}}/>
                <ControlGroup fill={false} vertical={false} align={Alignment.LEFT}>
                    <ControlGroup fill={true} vertical={true} align={Alignment.LEFT}>
                        <ControlGroup fill={false} vertical={false} align={Alignment.LEFT}>
                            <Tag minimal={true} style={{width:110,fontSize:11}} >From = {this.state.startTagImageIndex+1}</Tag>
                            &nbsp;&nbsp;
                            <Button icon='alignment-right' onClick={this.handleImageStartSelected}></Button>
                            &nbsp;&nbsp;
                            <Button icon='disable' onClick={this.handleImageDisable}></Button>
                            &nbsp;&nbsp;
                            <Button icon='selection' onClick={this.handleImageEnable}></Button>
                        </ControlGroup>
                        <div style={{'height':9}}/>
                        <ControlGroup fill={false} vertical={false} align={Alignment.LEFT}>
                            <Tag minimal={true} style={{width:110,fontSize:11}} >To = {this.state.endTagImageIndex+1}</Tag>
                            &nbsp;&nbsp;
                            <Button icon='alignment-left' onClick={this.handleImageEndSelected}></Button>
                            &nbsp;&nbsp;
                            <Button icon='delete' onClick={this.handleImageDelete}></Button>
                        </ControlGroup>
                    </ControlGroup>
                        &nbsp;&nbsp;&nbsp;
                        <Divider/>
                        &nbsp;&nbsp;&nbsp;
                    <ControlGroup fill={false} vertical={true} align={Alignment.LEFT}>
                        <ControlGroup fill={false} vertical={false} align={Alignment.LEFT}>
                            <div style={{width:300}}>
                                <TagInput onChange={(values) => this.setState({
                                        currentImage:{
                                            ...this.state.currentImage,
                                            scenes:values
                                        }
                                    })}
                                    placeholder="Separate sences with commas..."
                                    values={this.state.currentImage.scenes}
                                    rightElement={clearButton}
                                />
                            </div>
                            &nbsp;&nbsp;
                            <Button icon='confirm' onClick={this.applySenceToAll}></Button>
                        </ControlGroup>
                        <div style={{'height':9}}/>
                        <ControlGroup fill={false} vertical={false} align={Alignment.LEFT}>
                            <InputGroup style={{width:300,fontSize:11}} id="input-new" type='input' placeholder="Type bbox name here..."
                                onChange={this.handleBBoxNameClick}/>
                                {/*<Button icon='tick' onClick={this.handleBBoxNameClick} ></Button>*/}
                            &nbsp;&nbsp;
                            <Button icon='duplicate' onClick={this.handleApplyBBoxNameToAllClick}></Button>
                            &nbsp;&nbsp;
                            <Button icon='remove' onClick={this.handleRemoveSelectedBBoxClick}></Button>
                            &nbsp;&nbsp;
                            <Button icon='reset' onClick={this.handleClearAllBBoxClick}></Button>
                            &nbsp;&nbsp;
                        </ControlGroup>
                    </ControlGroup>
                        &nbsp;&nbsp;&nbsp;
                        <Divider/>
                        &nbsp;&nbsp;&nbsp;
                    <ControlGroup fill={false} vertical={false} align={Alignment.LEFT}>
                        <Switch defaultChecked={true} style={{fontSize:11}} label="Auto Update" onChange={(e)=>this.updateModeChanged(e)} />
                    </ControlGroup>
                </ControlGroup>
                <div id="modal-root"></div>
            </div>
        );
    }
}