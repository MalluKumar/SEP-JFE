
import { Icon } from 'leaflet';
//@ts-ignore
import { antPath } from 'leaflet-ant-path';
import React, { useEffect } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import { Job } from "./consts";

// props interface
interface IDirectionProps {
    job: Job,
    travelling: boolean,
    oldPath: any,
    updatePath: Function
}

function DirectionsRoute(props: IDirectionProps) {
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
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        // shadowSize: [41, 41]
    });

    const inactiveIcon: Icon = new Icon({
        className: 'leaflet-marker-icon leaflet-zoom-animated leaflet-interactive leaflet-marker-draggable',
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
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

    useEffect(() => {
        if (props.travelling) {
            var newPath = antPath(props.job.directionArray, pathOptions);
            map.addLayer(newPath);
        }

        if (props.oldPath != null) {
            map.removeLayer(props.oldPath);
        }
        else {
            if (props.travelling) {
                map.fitBounds(newPath.getBounds())
            }
        }

        props.updatePath(props.job.JobID, newPath);
    }, [props.job.directionArray]);


    if (props.travelling) {
        return <>
            {/* GST Marker */}
            <Marker draggable={true} position={[props.job.currentLat, props.job.currentLon]} icon={gstIcon}>
                <Popup>{'GST ID: ' + props.job.GSTID + ', Location: ' + [props.job.currentLat, props.job.currentLon]}</Popup>
            </Marker>
            {/* Travelling to Location Marker */}
            <Marker draggable={true} position={[props.job.endLat, props.job.endLon]} icon={jobIcon}>
                <Popup>{'Job ID: ' + props.job.JobID + ', Location: ' + [props.job.endLat, props.job.endLon]}</Popup>
            </Marker>
        </>
    }
    else {
        return <>
            {/* Job In Progress Location Marker */}
            <Marker draggable={true} position={[props.job.endLat, props.job.endLon]} icon={activeIcon}>
                <Popup>{'Job ID: ' + props.job.JobID + ', Location: ' + [props.job.endLat, props.job.endLon]}</Popup>
            </Marker>
        </>
    }
}

export default DirectionsRoute;
