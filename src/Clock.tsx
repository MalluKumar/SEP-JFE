import React from "react";
import { Sidebar } from "./Sidebar";

interface IClockProps {
  currentDateTime: Date;
  updateTime: Function;
}

export class Clock extends React.Component<IClockProps> {
  timerID: number;

  dateStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    right: 30,
    zIndex: 1000,
    fontSize: 16,
    fontWeight: "bold",
  };

  constructor(props: IClockProps) {
    super(props);
    this.timerID = 0;
  }

  componentDidMount() {
    this.timerID = window.setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    // this.props.updateTime(new Date(this.props.currentDateTime.setSeconds(this.props.currentDateTime.getSeconds() + 1)))
    // Currently set to increment + 1 minute.
    this.props.updateTime(new Date(this.props.currentDateTime.setMinutes(this.props.currentDateTime.getMinutes() + 1)))
  }

  render() {
    return (
      <div>
        <Sidebar currentDateTime={this.props.currentDateTime} />
      </div>
    );
  }
}