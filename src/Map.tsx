import { LatLngExpression } from 'leaflet';
import React from 'react';
import { Circle, LayerGroup, MapContainer, Marker, TileLayer } from 'react-leaflet';
import { Job, JobData } from './consts';

interface IMapProps {
    currentDateTime: Date,
    jobs: JobData[],
}

interface IMapState {
    activeJobs: Job[],
}

export default class JobMap extends React.Component<IMapProps, IMapState>{
    constructor(props: IMapProps) {
        super(props);
        this.state = {
            activeJobs: []
        };
    }

    centrePoint: LatLngExpression = [-33.900, 151.150] // Sydney coordinates
    dateStyle: React.CSSProperties = { position: 'absolute', top: 5, right: 5, zIndex: 1000, fontSize: 16, fontWeight: "bold" }
    baseMap: any = <TileLayer attribution='&copy; <a href="&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

    setActiveJobs() {
        let activeList: Job[] = []
        this.props.jobs.forEach(job => {
            // Some condition goes here
            activeList.push({
                status: "Incomplete",
                lat: job.Path[0].latitude,
                lon: job.Path[0].longitude,
            })
        });
        this.setState({activeJobs: activeList})
    }

    showActiveJobs() {
        return (
            <LayerGroup>
                {this.state.activeJobs.map(
                    function(job, i){ console.log(job); return <Marker key={"JobMarker" + i} position={[job.lat, job.lon]}></Marker> }
                )}
            </LayerGroup>)
    }

    render() {
        return (
            <div>
                <MapContainer id="container" center={this.centrePoint} zoom={15} scrollWheelZoom={true}>

                    {/* <p style={this.dateStyle}>
                    {`Date: ${this.props.currentDateTime.getDate()}, Time: ${this.props.currentDateTime.getTime()}`}
                </p> */}

                    {this.baseMap}
                    {this.showActiveJobs()}
                    {/* A show paths method should be built here or something */}
                </MapContainer>
                <button onClick={(e) => { this.setActiveJobs() }}>Show the Jobs</button>
            </div>
        )
    }
}