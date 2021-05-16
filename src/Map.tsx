import { LatLngExpression } from "leaflet";
import React from "react";
import { LayerGroup, MapContainer, TileLayer } from "react-leaflet";
import { Job, JobData } from "./consts";
import DirectionsRoute from "./DirectionsRoute";

interface IMapProps {
  currentDateTime: Date;
  jobs: JobData[];
  paths: Map<number, any>;
  updatePath: Function;
}

interface IMapState {
  activeJobs: Job[];
  directionLatLng: number[][];
}

export default class JobMap extends React.Component<IMapProps, IMapState> {
  constructor(props: IMapProps) {
    super(props);
    this.state = {
      activeJobs: [],
      directionLatLng: [[-33.9, 151.15]],
    };
  }

  centrePoint: LatLngExpression = [-33.9, 151.15]; // Sydney coordinates

  baseMap: any = (
    <TileLayer
      attribution='&copy; <a href="&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    />
  );

  setActiveJobs() {
    let activeList: Job[] = [];
    this.props.jobs.forEach((job) => {
      let coordinates: number[][] = [];

      job.Path.forEach((row) => {
        coordinates.push([row.latitude, row.longitude]);
      });

      activeList.push({
        status: "Incomplete",
        currentLat: job.Path[0].latitude,
        currentLon: job.Path[0].longitude,
        GSTID: job.GSTID,
        JobID: job.JobID,
        endLat: job.Path[job.Path.length - 1].latitude,
        endLon: job.Path[job.Path.length - 1].longitude,
        directionArray: coordinates,
      });
    });
    this.setState({ activeJobs: activeList });

    console.log(activeList);
  }

  showActiveJobs() {
    // console.log("Current Map Time: " + this.props.currentDateTime.toLocaleString());
    return (
      <LayerGroup>
        {this.props.jobs.map((job) => {
          let currentLat: number;
          let currentLon: number;
          let length = job.Path.length;
          let travelEndTime = new Date(job.EndTime);
          travelEndTime.setMinutes(
            travelEndTime.getMinutes() - job.JobDuration
          );

          // Divides number of coordinates by travel time to get number of coordinates
          let coordinateInterval = +(
            job.Path.length / job.TravelDuration
          ).toFixed();

          // Gets time in minutes from current time to job start time
          let timeSinceStartInMinutes = Math.floor(
            ((this.props.currentDateTime.valueOf() - job.StartTime.valueOf()) /
              (1000 * 60)) %
              60
          );

          // Multiply interval by time since start to get index of coordinate to use
          let arrayIndex = coordinateInterval * timeSinceStartInMinutes;

          // Create coord array containing unvisited coordinates
          let remainingCoordinates = job.Path.map((job) => job);

          // Set lat and long based on index
          if (arrayIndex === 0) {
            currentLat = job.Path[arrayIndex].latitude;
            currentLon = job.Path[arrayIndex].longitude;
          } else if (arrayIndex > 0 && arrayIndex < job.Path.length) {
            remainingCoordinates = remainingCoordinates.slice(arrayIndex - 1);
            currentLat = job.Path[arrayIndex - 1].latitude;
            currentLon = job.Path[arrayIndex - 1].longitude;
          } else {
            currentLat = job.Path[length - 1].latitude;
            currentLon = job.Path[length - 1].longitude;
          }

          let directionArray: number[][] = [];
          remainingCoordinates.forEach((row) => {
            directionArray.push([row.latitude, row.longitude]);
          });

          let activeJob: Job = {
            status: "Incomplete",
            currentLat: currentLat,
            currentLon: currentLon,
            GSTID: job.GSTID,
            JobID: job.JobID,
            endLat: job.Path[job.Path.length - 1].latitude,
            endLon: job.Path[job.Path.length - 1].longitude,
            directionArray: directionArray,
          };

          if (
            job.StartTime <= this.props.currentDateTime &&
            travelEndTime > this.props.currentDateTime
          ) {
            return (
              <DirectionsRoute
                job={activeJob}
                oldPath={this.props.paths.get(job.JobID)}
                updatePath={this.props.updatePath}
                travelling={true}
              />
            );
          } else if (
            travelEndTime <= this.props.currentDateTime &&
            job.EndTime >= this.props.currentDateTime
          ) {
            return (
              <DirectionsRoute
                job={activeJob}
                oldPath={this.props.paths.get(job.JobID)}
                updatePath={this.props.updatePath}
                travelling={false}
              />
            );
          }
        })}
      </LayerGroup>
    );
  }

  render() {
    return (
      <div>
        <MapContainer
          id="container"
          center={this.centrePoint}
          zoom={10}
          scrollWheelZoom={true}
        >
          {this.baseMap}
          {this.showActiveJobs()}
        </MapContainer>
        <button
          onClick={(e) => {
            this.setActiveJobs();
          }}
        >
          Show the Jobs
        </button>
      </div>
    );
  }
}
