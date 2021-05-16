import { Icon } from 'leaflet';
//@ts-ignore
import { antPath } from 'leaflet-ant-path';
import { useEffect } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import { FunctionObj, JobData } from "./consts";

// props interface
interface IDirectionProps {
    job: JobData,
    travelling: boolean,
    oldPath: any,
    currentDateTime: Date,
    functions: FunctionObj
}

const DirectionsRoute = (props: IDirectionProps) => {
    // leaflet map instance import
    const map = useMap();

    const jobIcon: Icon = new Icon({
        className: 'leaflet-marker-icon leaflet-zoom-animated leaflet-interactive leaflet-marker-draggable',
        iconUrl: `${process.env.PUBLIC_URL}/Job.png`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    const gstIcon: Icon = new Icon({
        className: 'leaflet-marker-icon leaflet-zoom-animated leaflet-interactive leaflet-marker-draggable',
        iconUrl: `${process.env.PUBLIC_URL}/GST.png`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    const activeIcon: Icon = new Icon({
        className: 'leaflet-marker-icon leaflet-zoom-animated leaflet-interactive leaflet-marker-draggable',
        iconUrl: `${process.env.PUBLIC_URL}/Person.png`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    const pathOptions = {
        "delay": 800,
        "dashArray": [10, 20],
        "weight": 5,
        "color": "#0000FF",
        "pulseColor": "#FFFFFF",
        "paused": false,
        "reverse": false,
        "hardwareAccelerated": true,
        "fitSelectedRoutes": true
    };

    let job = props.job;
    let currentLat = job.Path[0].latitude;
    let currentLon = job.Path[0].longitude;
    let endLat = job.Path[job.Path.length - 1].latitude
    let endLon = job.Path[job.Path.length - 1].longitude;

    // Divides number of coordinates by travel time to get number of intervals
    let coordinateInterval = +(job.Path.length / job.TravelDuration).toFixed();

    // Gets time in minutes from current time to job start time
    let timeSinceStartInMinutes = Math.floor(((props.currentDateTime.valueOf() - job.StartTime.valueOf()) / (1000 * 60)) % 60);

    // Multiply interval by time since start to get index of coordinate to use
    let arrayIndex = coordinateInterval * timeSinceStartInMinutes;

    // Create coord array containing unvisited coordinates 
    let remainingCoordinates = job.Path.map(coord => coord);

    // Set lat and long based on index
    if (arrayIndex > 0 && arrayIndex <= job.Path.length) {
        currentLat = job.Path[arrayIndex - 1].latitude;
        currentLon = job.Path[arrayIndex - 1].longitude;
        remainingCoordinates = remainingCoordinates.slice(arrayIndex - 1);
    }
    else if (arrayIndex >= job.Path.length) {
        currentLat = job.Path[job.Path.length - 1].latitude;
        currentLon = job.Path[job.Path.length - 1].longitude;
        remainingCoordinates = remainingCoordinates.slice(remainingCoordinates.length - 1);
    }

    let directionArray: number[][] = [];
    remainingCoordinates.forEach(row => {
        directionArray.push([row.latitude, row.longitude]);
    });

    useEffect(() => {
        if (props.travelling) {
            var newPath = antPath(directionArray, pathOptions);
            map.addLayer(newPath);
        }

        if (props.oldPath != null) {
            map.removeLayer(props.oldPath);
            if (!props.travelling) {
                if (job.TravelDuration < 30) {
                    props.functions.updateComplianceRate(true);
                }
                else {
                    props.functions.updateComplianceRate(false);
                }
                props.functions.updateDistance(job.DistanceTravelled);
            }
        }
        else {
            if (props.travelling) {
                map.fitBounds(newPath.getBounds());
            }
        }

        props.functions.updatePath(props.job.JobID, newPath);
    }, [remainingCoordinates]);


    if (props.travelling) {
        return <>
            {/* GST Marker */}
            <Marker draggable={true} position={[currentLat, currentLon]} icon={gstIcon}>
                <Popup>{'GST ID: ' + props.job.GSTID + ', Location: ' + [currentLat, currentLon]}</Popup>
            </Marker>
            {/* Travelling to Location Marker */}
            <Marker draggable={true} position={[endLat, endLon]} icon={jobIcon}>
                <Popup>{'Job ID: ' + props.job.JobID + ', Location: ' + [endLat, endLon]}</Popup>
            </Marker>
        </>
    }
    else {
        return <>
            {/* Job In Progress Location Marker */}
            <Marker draggable={true} position={[endLat, endLon]} icon={activeIcon}>
                <Popup>{'Job ID: ' + props.job.JobID + ', Location: ' + [endLat, endLon]}</Popup>
            </Marker>
        </>
    }
}

export default DirectionsRoute;
