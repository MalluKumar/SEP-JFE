import { Icon, LatLngExpression } from 'leaflet';
import React from 'react';
import { LayerGroup, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Job, JobData } from './consts';
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
    constructor(props: IMapProps) {
        super(props);
        this.state = {
            activeJobs: [],
            directionLatLng: [[-33.900, 151.150]],
        };
    }

    centrePoint: LatLngExpression = [-33.900, 151.150] // Sydney coordinates

    inactiveIcon: Icon = new Icon({
        className: 'leaflet-marker-icon leaflet-zoom-animated leaflet-interactive leaflet-marker-draggable',
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        // shadowUrl: 'https://unpkg.com/browse/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        // shadowSize: [41, 41]
    });

    activeIcon: Icon = new Icon({
        className: 'leaflet-marker-icon leaflet-zoom-animated leaflet-interactive leaflet-marker-draggable',
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        // shadowUrl: 'https://unpkg.com/browse/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        // shadowSize: [41, 41]
    });

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
        this.props.jobs.forEach(job => {
            activeList.push({
                status: "Incomplete",
                lat: job.Path[0].latitude,
                lon: job.Path[0].longitude,
            });
        });
        this.setState({ activeJobs: activeList })
    }

    showActiveJobs() {
        // console.log("Current Map Time: " + this.props.currentDateTime.toLocaleString());
        return (
            <LayerGroup>
                {this.props.jobs.map(job => {
                    let length = job.Path.length;
                    let travelEndTime = new Date(job.EndTime);
                    travelEndTime.setMinutes(travelEndTime.getMinutes() - job.JobDuration);

                    if (job.StartTime <= this.props.currentDateTime && travelEndTime > this.props.currentDateTime) {
                        let currentLat = job.Path[0].latitude;
                        let currentLon = job.Path[0].longitude;

                        // Divides number of coordinates by travel time to get number of coordinates
                        let coordinateInterval = +(job.Path.length / job.TravelDuration).toFixed();

                        // Gets time in minutes from current time to job start time
                        let timeSinceStartInMinutes = Math.floor(((this.props.currentDateTime.valueOf() - job.StartTime.valueOf()) / (1000 * 60)) % 60);

                        // Multiply interval by time since start to get index of coordinate to use
                        let arrayIndex = coordinateInterval * timeSinceStartInMinutes;

                        // Set lat and long based on index
                        if (arrayIndex == 0) {
                            currentLat = job.Path[arrayIndex].latitude;
                            currentLon = job.Path[arrayIndex].longitude;
                        }
                        else if (arrayIndex > 0 && arrayIndex < job.Path.length) {
                            currentLat = job.Path[arrayIndex - 1].latitude;
                            currentLon = job.Path[arrayIndex - 1].longitude;
                        }
                        else {
                            currentLat = job.Path[length - 1].latitude;
                            currentLon = job.Path[length - 1].longitude;
                        }

                        // Create coord array containing unvisited coordinates 
                        let remainingCoordinates = job.Path.map(job => job);
                        remainingCoordinates = remainingCoordinates.slice(arrayIndex);

                        return <>
                            <DirectionsRoute coords={remainingCoordinates} />
                            {/* GST Marker */}
                            <Marker draggable={true} position={[currentLat, currentLon]}>
                                <Popup>{'GST ID: ' + job.GSTID + ', Location: ' + [currentLat, currentLon]}</Popup>
                            </Marker>
                            {/* Travelling to Location Marker */}
                            <Marker draggable={true} position={[job.Path[length - 1].latitude, job.Path[length - 1].longitude]} icon={this.inactiveIcon}>
                                <Popup>{'Job ID: ' + job.JobID + ', Location: ' + [job.Path[length - 1].latitude, job.Path[length - 1].longitude]}</Popup>
                            </Marker>
                        </>
                    }
                    else if (travelEndTime <= this.props.currentDateTime && job.EndTime >= this.props.currentDateTime) {
                        return <>
                            {/* Job In Progress Location Marker */}
                            <Marker draggable={true} position={[job.Path[length - 1].latitude, job.Path[length - 1].longitude]} icon={this.activeIcon}>
                                <Popup>{'Job ID: ' + job.JobID + ', Location: ' + [job.Path[length - 1].latitude, job.Path[length - 1].longitude]}</Popup>
                            </Marker>
                        </>
                    }

                })}
            </LayerGroup>)
    }

    render() {
        return (
            <div>
                <MapContainer id="container" center={this.centrePoint} zoom={10} scrollWheelZoom={true}>
                    {this.baseMap}
                    {this.showActiveJobs()}
                </MapContainer>
                <button onClick={(e) => {
                    this.setActiveJobs()
                }}>Show the Jobs
                </button>
            </div>
        )
    }
}
