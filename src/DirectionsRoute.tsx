import React, { Component, useEffect } from "react";
import {LatLngTuple} from "leaflet";
import { Marker, useMap } from "react-leaflet";
//@ts-ignore
import {antPath} from 'leaflet-ant-path';
interface IDirectionProps {
    coords: LatLngTuple,
}
function DirectionsRoute(props: any) {
    const map = useMap();
    const {coords} = props;
    useEffect(()=>{
        // console.log(props)
        const path = antPath(coords, {
            "delay": 400,
            "dashArray": [
                10,
                20
            ],
            "weight": 5,
            "color": "#0000FF",
            "pulseColor": "#FFFFFF",
            "paused": false,
            "reverse": false,
            "hardwareAccelerated": true
        });
        map.addLayer(path);
        map.fitBounds(path.getBounds())
    },[coords]);

    const position: LatLngTuple = coords[coords.length-1];

    return <Marker position={position}></Marker>;
}


export default DirectionsRoute;
