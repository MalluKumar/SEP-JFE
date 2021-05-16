import { LatLngExpression } from 'leaflet';
import React from 'react';
import { LayerGroup, MapContainer, TileLayer } from 'react-leaflet';
import { FunctionObj, Job, JobData } from './consts';
import DirectionsRoute from './DirectionsRoute';

interface IMapProps {
    currentDateTime: Date,
    jobs: JobData[],
    paths: Map<number, any>,
    functions: FunctionObj,
}

interface IMapState {
    activeJobs: Job[]
}

export default class JobMap extends React.Component<IMapProps, IMapState> {
    constructor(props: IMapProps) {
        super(props);
        this.state = {
            activeJobs: []
        };
    }

    centrePoint: LatLngExpression = [-33.900, 151.150] // Sydney coordinates

    baseMap: any = <TileLayer
        attribution='&copy; <a href="&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

    showActiveJobs() {
        let jobArray = Array.from(this.props.jobs.values());
        return (
            <LayerGroup>
                {jobArray.map(job => {
                    let travelEndTime = new Date(job.EndTime);
                    travelEndTime.setMinutes(travelEndTime.getMinutes() - job.JobDuration);

                    if (travelEndTime > this.props.currentDateTime && job.StartTime <= this.props.currentDateTime) {
                        return <DirectionsRoute
                            currentDateTime={this.props.currentDateTime}
                            job={job}
                            oldPath={this.props.paths.get(job.JobID)}
                            functions={this.props.functions}
                            travelling={true}
                        />
                    }
                    else if (travelEndTime <= this.props.currentDateTime && job.EndTime >= this.props.currentDateTime) {
                        return <DirectionsRoute
                            currentDateTime={this.props.currentDateTime}
                            job={job}
                            oldPath={this.props.paths.get(job.JobID)}
                            functions={this.props.functions}
                            travelling={false}
                        />
                    }
                })}
            </LayerGroup>
        )
    }

    render() {
        return (
            <MapContainer id="container" center={this.centrePoint} zoom={10} scrollWheelZoom={true}>
                {this.baseMap}
                {this.showActiveJobs()}
            </MapContainer>
        )
    }
}
