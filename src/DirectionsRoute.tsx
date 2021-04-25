import React, { Component, useEffect } from "react";
import L, {LatLngTuple} from "leaflet";
import {Marker, Popup, useMap} from "react-leaflet";
//@ts-ignore
import {antPath} from 'leaflet-ant-path';
interface IDirectionProps {
    coords: number[][],
    sdtid: string,
}
function DirectionsRoute(props: any) {
    const map = useMap();
    const {coords, sdtid} = props;
    useEffect(() => {
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
    }, [coords]);

    const position: LatLngTuple = coords[coords.length - 1];
    // const myIcon = L.icon({
    //     iconUrl: "icon_33997.svg",
    //     // iconAnchor: pinAnchor
    // });
    return <Marker draggable={true}
                   position={position}><Popup>{'GSTID: ' + sdtid + ', Location: ' + position}</Popup></Marker>;
}

export default DirectionsRoute;
