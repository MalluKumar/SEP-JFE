import React from "react";

interface IClockProps {
  currentDateTime: Date,    
}

interface IClockState {
    date: Date,
}

export class Clock extends React.Component<IClockProps, IClockState> {
    timerID: number;

    dateStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        right: 30,
        zIndex: 1000,
        fontSize: 16,
        fontWeight: "bold"
    }

    constructor(props: IClockProps) {
      super(props);
      this.timerID = 0;
      console.log(props.currentDateTime);
      this.state = {date: props.currentDateTime};
    }
   
    componentDidMount() {
      this.timerID = window.setInterval(
        () => this.tick(),
        1000
      );
    }
  
    componentWillUnmount() {
      clearInterval(this.timerID);
    }
  

    tick() {      
      this.setState({  
        date: new Date(this.state.date.setSeconds(this.state.date.getSeconds() + 1))
      });
    }
  
    render() {
      return (
        <div style={this.dateStyle}>
          <h2>{this.state.date.toLocaleDateString()}<br></br> {this.state.date.toLocaleTimeString()}</h2>
        </div>
      );
    }
  }
  
//   ReactDOM.render(
//     <Clock />,
//     document.getElementById('root')
//   );