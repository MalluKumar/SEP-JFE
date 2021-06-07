import DriveEtaIcon from '@material-ui/icons/DriveEta';
import HomeWorkIcon from '@material-ui/icons/HomeWork';
import WorkIcon from '@material-ui/icons/Work';
import { DivIcon } from 'leaflet';
//@ts-ignore
import { antPath } from 'leaflet-ant-path';
import { useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Marker, Popup, useMap } from "react-leaflet";
import { ActiveJob, FunctionObj } from "./consts";

// props interface
interface IDirectionProps {
    job: ActiveJob,
    currentDateTime: Date,
    functions: FunctionObj,
}

const DirectionsRoute = (props: IDirectionProps) => {
    // leaflet map instance import
    const map = useMap();

    // material ui icon for showing job location
    const jobIcon: DivIcon = new DivIcon({
        className: 'material-icons',
        html: renderToStaticMarkup(<HomeWorkIcon style={{ fontSize: 30 }} />),
        iconSize: [30, 30],
        iconAnchor: [15, 20],
        popupAnchor: [3, -20],
    });

    // material ui icon for shpwing GST location
    const gstIcon: DivIcon = new DivIcon({
        className: 'material-icons',
        html: renderToStaticMarkup(<DriveEtaIcon style={{ fontSize: 30 }} />),
        iconSize: [30, 30],
        iconAnchor: [15, 20],
        popupAnchor: [3, -20],
    });

    // material ui icon for showing GST at work
    const jobInProgressIcon: DivIcon = new DivIcon({
        className: 'material-icons',
        html: renderToStaticMarkup(<WorkIcon style={{ fontSize: 30 }} />),
        iconSize: [30, 30],
        iconAnchor: [15, 20],
        popupAnchor: [3, -20],
    });

    // define the properties of path
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

    useEffect(() => {
        
        // update the routes based on the remaining coordinate points
        if (job.Status === "Travelling") {
            let directionArray: number[][] = [];

            job.remainingCoordinates.forEach(row => {
                directionArray.push([row.latitude, row.longitude]);
            });

            var newPath = antPath(directionArray, pathOptions);
            map.addLayer(newPath);

            props.functions.updatePath(props.job.JobID, newPath);
        }

        if (job.oldPath != null) {
            map.removeLayer(job.oldPath);
        }

    }, [job.remainingCoordinates]);


    if (job.Status === "Travelling") {
        return <>
            {/* GST Marker */}
            <Marker draggable={true} position={[job.currentLat, job.currentLon]} icon={gstIcon}>
                <Popup>{'GST ID: ' + job.GSTID + ', Location: ' + [job.currentLat, job.currentLon]}</Popup>
            </Marker>
            {/* Travelling to Location Marker */}
            <Marker draggable={true} position={[job.endLat, job.endLon]} icon={jobIcon}>
                <Popup>{'Job ID: ' + job.JobID + ', Location: ' + [job.endLat, job.endLon]}</Popup>
            </Marker>
        </>
    }
    else if (job.Status === "In Progress") {
        return <>
            {/* Job In Progress Location Marker */}
            <Marker draggable={true} position={[job.endLat, job.endLon]} icon={jobInProgressIcon}>
                <Popup>{'Job ID: ' + job.JobID + ', Location: ' + [job.endLat, job.endLon]}</Popup>
            </Marker>
        </>
    }
    else {
        return <></>
    }
}

export default DirectionsRoute;
