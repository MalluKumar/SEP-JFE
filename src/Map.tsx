import { LatLngExpression } from 'leaflet';
import React, { useEffect } from 'react';
import { LayerGroup, MapContainer, TileLayer } from 'react-leaflet';
import { FunctionObj, JobData } from './consts';
import DirectionsRoute from './DirectionsRoute';

interface IMapProps {
    currentDateTime: Date,
    jobs: JobData[],
    paths: Map<number, any>,
    functions: FunctionObj,
}

const JobMap = (props: IMapProps) => {

    const centrePoint: LatLngExpression = [-33.900, 151.150] // Sydney coordinates

    const baseMap: any = <TileLayer
        attribution='&copy; <a href="&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

    function showActiveJobs() {
        return (
            <LayerGroup>
                {props.jobs.map(job => {
                    // Create coord array containing unvisited coordinates 
                    let remainingCoordinates = job.Path.map(coord => coord);
                    let modified = false;
                    let travelEndTime = new Date(job.EndTime);
                    travelEndTime.setMinutes(travelEndTime.getMinutes() - job.JobDuration);

                    if (job.Status !== "Complete") {
                        if (travelEndTime > props.currentDateTime && job.StartTime <= props.currentDateTime) {
                            if (job.Status !== "Travelling") {
                                job.Status = "Travelling"
                                modified = true;
                            }
                            // Divides number of coordinates by travel time to get number of intervals
                            let coordinateInterval = +(job.Path.length / job.TravelDuration).toFixed();

                            // Gets time in minutes from current time to job start time
                            let timeSinceStartInMinutes = Math.floor(((props.currentDateTime.valueOf() - job.StartTime.valueOf()) / (1000 * 60)) % 60);

                            // Multiply interval by time since start to get index of coordinate to use
                            let arrayIndex = coordinateInterval * timeSinceStartInMinutes;

                            // Set lat and long based on index
                            if (arrayIndex > 0 && arrayIndex <= job.Path.length) {
                                remainingCoordinates = remainingCoordinates.slice(arrayIndex - 1);
                            }
                            else if (arrayIndex >= job.Path.length) {
                                remainingCoordinates = remainingCoordinates.slice(remainingCoordinates.length - 1);
                            }
                        }

                        if (props.currentDateTime >= travelEndTime) {
                            if (job.Status !== "In Progress") {
                                job.Status = "In Progress"
                                modified = true;

                                let exceedsCompliance = true;

                                if (job.TravelDuration < 30) {
                                    exceedsCompliance = false;
                                }

                                props.functions.updateComplianceRate(exceedsCompliance);
                                props.functions.updateDistance(job.DistanceTravelled);
                            }
                        }

                        if (props.currentDateTime >= job.EndTime && job.Status === "In Progress") {
                            job.Status = "Complete"
                            modified = true;
                            props.functions.updateTimeSpentOnJob(job.JobDuration);
                        }

                        if (modified) {
                            props.functions.updateJob(job);
                        }
                    }

                    return <DirectionsRoute
                        currentDateTime={props.currentDateTime}
                        job={job}
                        remainingCoordinates={remainingCoordinates}
                        oldPath={props.paths.get(job.JobID)}
                        functions={props.functions}
                    />
                })}
            </LayerGroup>
        )
    }

    useEffect(() => {
        showActiveJobs();
    }, [props.jobs]);


    return (
        <MapContainer id="container" center={centrePoint} zoom={10} scrollWheelZoom={true}>
            {baseMap}
            {showActiveJobs()}
        </MapContainer>
    )

}

export default JobMap;
