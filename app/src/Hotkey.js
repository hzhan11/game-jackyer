
import React from 'react';

export class KeyBind extends React.Component {

    componentDidMount(){
        document.getElementById('screen-pic').addEventListener("keydown", this.onKeyDown)
    }
  
    componentWillUnmount(){
        document.getElementById('screen-pic').removeEventListener("keydown", this.onKeyDown)
    }
  
    onKeyDown = (e) => {
      alert(e.keyCode);
      switch(e.keyCode) {
        case 13://回车事件
          break
      }
    }

    render(){
        return(
            <div></div>
        )
    }

  }