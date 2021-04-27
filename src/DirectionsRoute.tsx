import React, { Component, useEffect } from "react";
import L, {LatLngTuple} from "leaflet";
import {Marker, Popup, useMap} from "react-leaflet";
// there is no typres of leaflet ant path so we have to ignore ts
//@ts-ignore
import {antPath} from 'leaflet-ant-path';
// props interface
interface IDirectionProps {
    coords: number[][],
    sdtid: string,
}
function DirectionsRoute(props: any) {
    // leaflet map instance import
    const map = useMap();
    const {coords, sdtid} = props;
    useEffect(() => {
        // console.log(props)
        // ant path instance
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
        // add ant path layer
        map.addLayer(path);
        // fit to bound
        map.fitBounds(path.getBounds())
    }, [coords]);
    // last coordinate of each array/job
    const position: LatLngTuple = coords[coords.length - 1];
    // const myIcon = L.icon({
    //     iconUrl: "icon_33997.svg",
    //     // iconAnchor: pinAnchor
    // });
//     marker  of last point in array/means last point of route and popup for marker
    return <Marker draggable={true}
                   position={position}><Popup>{'GSTID: ' + sdtid + ', Location: ' + position}</Popup></Marker>;
}

export default DirectionsRoute;
