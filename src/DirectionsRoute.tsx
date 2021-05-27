import { Icon } from 'leaflet';
//@ts-ignore
import { antPath } from 'leaflet-ant-path';
import { useEffect } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import { CoordPoint, FunctionObj, JobData } from "./consts";

// props interface
interface IDirectionProps {
    job: JobData,
    oldPath: any,
    currentDateTime: Date,
    functions: FunctionObj,
    remainingCoordinates: CoordPoint[]
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
    let currentLat = props.remainingCoordinates[0].latitude;
    let currentLon = props.remainingCoordinates[0].longitude;
    let endLat = job.Path[job.Path.length - 1].latitude
    let endLon = job.Path[job.Path.length - 1].longitude;

    useEffect(() => {
        if (job.Status === "Travelling") {
            let directionArray: number[][] = [];
            props.remainingCoordinates.forEach(row => {
                directionArray.push([row.latitude, row.longitude]);
            });

            var newPath = antPath(directionArray, pathOptions);
            map.addLayer(newPath);

            props.functions.updatePath(props.job.JobID, newPath);
        }

        if (props.oldPath != null) {
            map.removeLayer(props.oldPath);
        }
        else {
            if (job.Status === "Travelling") {
                map.fitBounds(newPath.getBounds());
            }
        }
    }, [props.remainingCoordinates]);


    if (job.Status === "Travelling") {
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
    else if (job.Status === "In Progress") {
        return <>
            {/* Job In Progress Location Marker */}
            <Marker draggable={true} position={[endLat, endLon]} icon={activeIcon}>
                <Popup>{'Job ID: ' + props.job.JobID + ', Location: ' + [endLat, endLon]}</Popup>
            </Marker>
        </>
    }
    else {
        return <></>
    }
}

export default DirectionsRoute;
