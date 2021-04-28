import { LatLngExpression } from 'leaflet';
import React from 'react';
import { LayerGroup, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Job, JobData } from './consts';
//  ant map componenet import
import DirectionsRoute from './DirectionsRoute';

interface IMapProps {
    currentDateTime: Date,
    jobs: JobData[]
}

interface IMapState {
    activeJobs: Job[],
    directionLatLng: number[][]
}

export default class JobMap extends React.Component<IMapProps, IMapState> {
    timerID: number;
    
    constructor(props: IMapProps) {
        super(props);
        this.state = {
            activeJobs: [],
            directionLatLng: [[-33.900, 151.150]]
        }; 
        this.timerID = 0;
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
            activeList.push({
                status: "Incomplete",
                lat: job.Path[0].latitude,
                lon: job.Path[0].longitude,
            });        
            
            // Some condition goes here
            
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
                {/* {this.state.activeJobs.map(*/}
                {/*    function (job, i) {*/}
                {/*        return <Marker key={"JobMarker" + i} position={[job.lat, job.lon]}></Marker>*/}
                {/*    }*/}
                {/*)}*/}
                {/* select props which are comming from App.tsx and run the compnenet of Ant map and Add marker and popup*/}
                {this.props.jobs.map(job => {
                    // console.log(job.Path[0].latitude)
                    let directionArray: number[][] = [];

                    console.log("Current Map Time: " + this.props.currentDateTime.toLocaleString());
                    if(job.StartTime <= this.props.currentDateTime && job.EndTime >= this.props.currentDateTime)
                    {
                        job.Path.forEach(row => {
                            directionArray.push([row.latitude, row.longitude])
                        });
                        return <><DirectionsRoute coords={directionArray} sdtid={job.GSTID}/><Marker draggable={true} position={[job.Path[0].latitude, job.Path[0].longitude]}><Popup>{'GSTID: '+job.GSTID+', Location: '+[job.Path[0].latitude, job.Path[0].longitude]}</Popup></Marker></> 
                    }                    
                })}

            </LayerGroup>)
    }
      
    render() {
        console.log();
        return (
            <div>
                <MapContainer id="container" center={this.centrePoint} zoom={10} scrollWheelZoom={true}>
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
