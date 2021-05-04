import React from "react";

interface IClockProps {
  currentDateTime: Date,
  updateTime: Function,
}

interface IClockState {

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
    // this.props.updateTime(new Date(this.props.currentDateTime.setSeconds(this.props.currentDateTime.getSeconds() + 1)))
    // Currently set to increment +5 minutes.
    this.props.updateTime(new Date(this.props.currentDateTime.setMinutes(this.props.currentDateTime.getMinutes() + 1)))
  }

  render() {
    return (
      <div style={this.dateStyle}>
        <h2>{this.props.currentDateTime.toLocaleDateString()}<br />{this.props.currentDateTime.toLocaleTimeString()}</h2>
      </div>
    );
  }
}

//   ReactDOM.render(
//     <Clock />,
//     document.getElementById('root')
//   );