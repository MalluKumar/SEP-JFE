import { LatLngExpression } from 'leaflet';
import { useEffect, useState } from 'react';
import { LayerGroup, MapContainer, TileLayer } from 'react-leaflet';
import { ActiveJob, FunctionObj, JobData } from './consts';
import DirectionsRoute from './DirectionsRoute';

interface IMapProps {
    currentDateTime: Date,
    jobs: JobData[],
    paths: Map<number, any>,
    functions: FunctionObj,
}

const JobMap = (props: IMapProps) => {

    const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
    const centrePoint: LatLngExpression = [-33.900, 151.150] // Sydney coordinates
    var distanceTravelled: number = 0;
    var arrivedOnTime: number = 0;
    var arrivedAtJob: number = 0;
    var timeOnJobs: number = 0;
    var jobsCompleted: number = 0;

    // get the cartodb positron base map
    const baseMap: any = <TileLayer
        attribution='&copy; <a href="&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

    function updateJobs() {
        let jobList = [];

        for (var job of props.jobs) {
            if (job.Status !== "Complete") {
                let remainingCoordinates = job.Path.map(coord => coord);
                let modified = false;
                let travelEndTime = new Date(job.EndTime);
                travelEndTime.setMinutes(travelEndTime.getMinutes() - job.JobDuration);

                // Update job details if travelling
                if (travelEndTime > props.currentDateTime && job.StartTime <= props.currentDateTime) {

                    if (job.Status === "Scheduled") {
                        job.Status = "Travelling";
                        modified = true;
                    }

                    // Divides number of coordinates by travel time to get number of intervals in trip
                    let coordinateInterval = +(job.Path.length / job.TravelDuration).toFixed();

                    // Gets time in minutes from current time to job start time
                    let timeSinceStartInMinutes = Math.floor(((props.currentDateTime.valueOf() - job.StartTime.valueOf()) / (1000 * 60)) % 60);

                    // Multiply interval by time since start to get index of coordinate to use
                    let arrayIndex = coordinateInterval * timeSinceStartInMinutes;

                    // Set remaining coordinates based on index
                    if (arrayIndex > 0 && arrayIndex <= job.Path.length) {
                        remainingCoordinates = remainingCoordinates.slice(arrayIndex - 1);
                    }
                    else if (arrayIndex >= job.Path.length) {
                        remainingCoordinates = remainingCoordinates.slice(remainingCoordinates.length - 1);
                    }
                }

                // Update details if job is in progress
                if (props.currentDateTime >= travelEndTime) {
                    if (job.Status !== "In Progress") {
                        job.Status = "In Progress";
                        modified = true;

                        arrivedAtJob += 1;

                        if (job.TravelDuration < 30) {
                            arrivedOnTime += 1;
                        }

                        distanceTravelled += Number(job.DistanceTravelled);
                    }
                }

                // update the job when job completes
                if (props.currentDateTime >= job.EndTime && job.Status === "In Progress") {
                    job.Status = "Complete"
                    modified = true;
                    timeOnJobs += Number(job.JobDuration);
                    jobsCompleted += 1;
                }

                if (modified) {
                    props.functions.updateJob(job);
                }

                if (job.Status != "Scheduled") {
                    let currentJob: ActiveJob = {
                        GSTID: job.GSTID,
                        JobID: job.JobID,
                        Status: job.Status,
                        currentLat: remainingCoordinates[0].latitude,
                        currentLon: remainingCoordinates[0].longitude,
                        endLat: job.Path[job.Path.length - 1].latitude,
                        endLon: job.Path[job.Path.length - 1].longitude,
                        remainingCoordinates: remainingCoordinates,
                        oldPath: props.paths.get(job.JobID)
                    };

                    jobList.push(currentJob);
                }
            }
        }

        setActiveJobs(jobList);
        props.functions.setComplianceRate(arrivedOnTime, arrivedAtJob);
        props.functions.setDistanceTravelled(distanceTravelled);
        props.functions.setTimeOnJobs(timeOnJobs);
        props.functions.updateCompletedJobs(jobsCompleted);
    }

    // display the directions of the active jobs
    function showActiveJobs() {
        return (
            <LayerGroup>
                {activeJobs.map(job => {
                    return <DirectionsRoute
                        currentDateTime={props.currentDateTime}
                        job={job}
                        functions={props.functions}
                    />
                })}
            </LayerGroup>
        )
    }

    useEffect(() => {
        updateJobs();
    }, [props.currentDateTime]);


    return (
        <MapContainer id="container" center={centrePoint} zoom={10} scrollWheelZoom={true}>
            {baseMap}
            {showActiveJobs()}
        </MapContainer>
    )
}

export default JobMap;
