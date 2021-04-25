import React from 'react';
import {LatLngTuple, LatLngExpression} from 'leaflet';
import {Circle, LayerGroup, MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';
import {Job, JobData, CoordPoint} from './consts';
//  ant map componenet import
import DirectionsRoute from './DirectionsRoute';

interface IMapProps {
    currentDateTime: Date,
    jobs: JobData[],
}

interface IMapState {
    activeJobs: Job[],
    directionLatLng: number[][],
}

export default class JobMap extends React.Component<IMapProps, IMapState> {
    constructor(props: IMapProps) {
        super(props);
        this.state = {
            activeJobs: [],
            directionLatLng: [[-33.900, 151.150]],
        };
    }
    centrePoint: LatLngExpression = [-33.900, 151.150] // Sydney coordinates
    dateStyle: React.CSSProperties = {
        position: 'absolute',
        top: 5,
        right: 5,
        zIndex: 1000,
        fontSize: 16,
        fontWeight: "bold"
    }
    baseMap: any = <TileLayer
        attribution='&copy; <a href="&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

    setActiveJobs() {
        let activeList: Job[] = [];
        // let directionArray: number[][] = [];
        this.props.jobs.forEach(job => {
            // Some condition goes here
            activeList.push({
                status: "Incomplete",
                lat: job.Path[0].latitude,
                lon: job.Path[0].longitude,
            });
            // console.log(job);
            // job.Path.forEach(row => {
            //     directionArray.push([row.latitude, row.longitude])
            // });
        });
        this.setState({ activeJobs: activeList })
    }


    showActiveJobs() {

        return (
            <LayerGroup>
                {/*{this.state.activeJobs.map(*/}
                {/*    function (job, i) {*/}
                {/*        return <Marker key={"JobMarker" + i} position={[job.lat, job.lon]}></Marker>*/}
                {/*    }*/}
                {/*)}*/}
                {/* select props which are comming from App.tsx and run the compnenet of Ant map and Add marker and popup*/}
                {this.props.jobs.map(job => {
                    // console.log(job.Path[0].latitude)
                    let directionArray: number[][] = [];
                    job.Path.forEach(row => {
                        directionArray.push([row.latitude, row.longitude])
                    });
                    return <><DirectionsRoute coords={directionArray} sdtid={job.GSTID}/><Marker draggable={true} position={[job.Path[0].latitude, job.Path[0].longitude]}><Popup>{'GSTID: '+job.GSTID+', Location: '+[job.Path[0].latitude, job.Path[0].longitude]}</Popup></Marker></>

                })}

            </LayerGroup>)
    }

    render() {
        return (
            <div>
                <MapContainer id="container" center={this.centrePoint} zoom={5} scrollWheelZoom={true}>

                    {/* <p style={this.dateStyle}>
                        {`Date: ${this.props.currentDateTime.getDate()}, Time: ${this.props.currentDateTime.getTime()}`}
                    </p> */}

                    {this.baseMap}
                    {this.showActiveJobs()}
                    {/* A show paths method should be built here or something */}
                </MapContainer>
                <button onClick={(e) => {
                    this.setActiveJobs()
                }}>Show the Jobs
                </button>
            </div>
        )
    }
}
