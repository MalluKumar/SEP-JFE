import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
//@ts-ignore
import AntPath from 'react-leaflet-ant-path';
//@ts-ignore
import {antPath} from 'leaflet-ant-path';
import { JobData } from "./consts";

// props interface
interface IDirectionProps {
    currentDateTime: Date,
    jobList: JobData[]
}

function DirectionsRoute(props: IDirectionProps) {
    // leaflet map instance import
    const map = useMap();
    const pathOptions = {
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
        "hardwareAccelerated": true,
        "fitSelectedRoutes": true
    };

    useEffect(() => {
        props.jobList.map((job: JobData) => {
            if (job.StartTime <= props.currentDateTime && job.EndTime >= props.currentDateTime) {
                let directionArray: number[][] = [];
                job.Path.forEach(row => {
                    directionArray.push([row.latitude, row.longitude])
                });
                // ant path instance
                const path = antPath(directionArray, pathOptions);
                // add ant path layer
                map.addLayer(path);
                // fit to bound
                // map.fitBounds(path.getBounds())

                // <AntPath positions={job.Path} options={pathOptions} ></AntPath>
            }
        })
    }, [props.jobList]);

    return (
        <div>
            {/* {props.jobList.map((job: JobData) => {
                if (job.StartTime <= props.currentDateTime && job.EndTime >= props.currentDateTime) {
                    

                    <AntPath positions={job.Path} options={pathOptions} ></AntPath>
                }
            })} */}
        </div>)
}

export default DirectionsRoute;
