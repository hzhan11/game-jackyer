import { Alignment, Button, ButtonGroup, Label, Elevation, FormGroup, InputGroup } from "@blueprintjs/core";
import React from 'react';
import Chart from "react-apexcharts";
import emitter from "./event"
import {asyncGetImageList} from './dataSource';

export class ImageLableStatForm extends React.Component {
    
    constructor(props) {

        super(props);
        this.state = { 
            data: null,
        };
        
        this.state = {
            bbox:{
                series: [1, 1, 1],
                options: {
                    labels: ['undefined', 'undefined', 'undefined'],
                    legend: {
                        show: true,
                        position: 'bottom',
                        horizontalAlign: 'center', 
                        labels: {
                            useSeriesColors: true
                        }
                    },
                    title: {
                        text: 'BBox Summary',
                        align: 'center',
                        margin: 5,
                        offsetX: 0,
                        offsetY: 0,
                        floating: false,
                        style: {
                          fontSize:  '12px',
                          fontWeight:  'normal',
                          color:  'white'
                        },
                    },
                    dataLabels: {
                        formatter: function (val, opt) {
                            return opt.w.config.series[opt.seriesIndex];
                        },
                    },
                }
            },
            scene:{
                series: [1, 1, 1],
                options: {
                    labels: ['undefined', 'undefined', 'undefined'],
                    legend: {
                        show: true,
                        position: 'bottom',
                        horizontalAlign: 'center', 
                        labels: {
                            useSeriesColors: true
                        }
                    },
                    title: {
                        text: 'Label Summary',
                        align: 'center',
                        margin: 5,
                        offsetX: 0,
                        offsetY: 0,
                        floating: false,
                        style: {
                          fontSize:  '12px',
                          fontWeight:  'normal',
                          color:  'white'
                        },
                    },
                    dataLabels: {
                        formatter: function (val, opt) {
                            return opt.w.config.series[opt.seriesIndex];
                        },
                    },
                }
            },
        };

        this.loadImageLablingDataAndAnalysis = this.loadImageLablingDataAndAnalysis.bind(this);

    }

    componentDidMount(){
        this.eventEmitter = emitter.addListener("dataUpdated",()=>{
            this.loadImageLablingDataAndAnalysis();
        });
        this.loadImageLablingDataAndAnalysis();
    }

    componentWillUnmount(){
        emitter.removeListener("dataUpdated", ()=>{;});
    }

    loadImageLablingDataAndAnalysis(){
        asyncGetImageList((data)=>{
            let images = data.images;
            var all_bbox_list = []; // {id, name}
            let names_bbox = []
            let counts_bbox = []
            let names_scene = []
            let counts_scene = []
            images.forEach(img => {
                img.bboxs.forEach(bbox => {
                    all_bbox_list.push({'id':bbox.id, 'name':bbox.name})
                    let index = names_bbox.indexOf(bbox.name);
                    if(index === -1){
                        names_bbox.push(bbox.name);
                        counts_bbox.push(1);
                    }
                    else{
                        counts_bbox[index]+=1;
                    }
                });
                img.scenes.forEach(scene => {
                    let index = names_scene.indexOf(scene);
                    if(index === -1){
                        names_scene.push(scene);
                        counts_scene.push(1);
                    }
                    else{
                        counts_scene[index]+=1;
                    }
                });
            });
            this.setState({
                bbox:{
                    ...this.state.bbox,
                    series: counts_bbox,
                    options:{
                        ...this.state.bbox.options,
                        labels: names_bbox
                    }
                },
                scene:{
                    ...this.state.scene,
                    series: counts_scene,
                    options:{
                        ...this.state.scene.options,
                        labels: names_scene
                    }
                }
            })
        });
    }

    render() {
        return(
            <div >
                <Chart
                    options={this.state.scene.options}
                    series={this.state.scene.series}
                    type="pie"
                    width="280"
                    height="300"
                />
                <div style={{height:20}}></div>
                <Chart
                    options={this.state.bbox.options}
                    series={this.state.bbox.series}
                    type="pie"
                    width="280"
                    height="300"
                />
            </div>
        );
    }
}