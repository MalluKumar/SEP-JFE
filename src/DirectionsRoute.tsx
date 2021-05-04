//@ts-ignore
import { antPath } from 'leaflet-ant-path';
import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import { CoordPoint } from "./consts";

// props interface
interface IDirectionProps {
    coords: CoordPoint[]
}

function DirectionsRoute(props: IDirectionProps) {
    // leaflet map instance import

    const map = useMap();
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
        let directionArray: number[][] = [];
        props.coords.forEach(row => {
            directionArray.push([row.latitude, row.longitude])
        });
        // ant path instance
        const newPath = antPath(directionArray, pathOptions);
        // add ant path layer  
        newPath.addTo(map);

        map.eachLayer(function (layer) {
            console.log(layer);
        });

        // fit to bound
        map.fitBounds(newPath.getBounds())
    }, []);

    return (
        <div>
        </div>)
}

export default DirectionsRoute;
