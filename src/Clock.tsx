import React from "react";
import { JobData } from "./consts";
import { Sidebar } from "./Sidebar";

interface IClockProps {
  currentDateTime: Date,
  updateTime: Function,
  complianceRate: number,
  distanceTravelled: number,
  timeOnJobs: number
  jobData: JobData[]
}

export class Clock extends React.Component<IClockProps> {
  timerID: number;
  rate: number;

  constructor(props: IClockProps) {
    super(props);
    this.timerID = 0;
    this.rate = 1;
  }

  componentDidMount() {
    this.timerID = window.setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  updateRate = (speed: number) => {
    this.rate = speed;
  }

  tick() {
    if (this.rate === 1) {
      this.props.updateTime(new Date(this.props.currentDateTime.setMinutes(this.props.currentDateTime.getMinutes() + 1)))
    }
    else if (this.rate === 2) {
      this.props.updateTime(new Date(this.props.currentDateTime.setMinutes(this.props.currentDateTime.getMinutes() + 5)))
    }
    else if (this.rate === 3) {
      this.props.updateTime(new Date(this.props.currentDateTime.setMinutes(this.props.currentDateTime.getMinutes() + 15)))
    }
    else if (this.rate === 4) {
      this.props.updateTime(new Date(this.props.currentDateTime.setMinutes(this.props.currentDateTime.getMinutes() + 30)))
    }
    else if (this.rate === 5) {
      this.props.updateTime(new Date(this.props.currentDateTime.setHours(this.props.currentDateTime.getHours() + 1)))
    }
  }

  render() {
    return (
      <div>
        <Sidebar currentDateTime={this.props.currentDateTime} complianceRate={this.props.complianceRate} distanceTravelled={this.props.distanceTravelled} timeOnJobs={this.props.timeOnJobs} updateRate={this.updateRate} />
      </div>
    );
  }
}