import { render, screen } from '@testing-library/react';
import  DirectionsRoute  from './DirectionsRoute';
import { CoordPoint,JobStatus, ActiveJob, FunctionObj } from "./consts";
import { MapContainer } from 'react-leaflet';
it('test correctly when Direction render', () => {

    interface JobData {
        JobID: number,
        GSTID: number,
        Address: string,
        Suburb: string,
        Postcode: number,
        StartTime: Date,
        IdleDuration: number,
        TravelDuration: number,
        JobDuration: number,
        EndTime: Date,
        DistanceTravelled: number,
        Path: CoordPoint[],
        Priority: string,
        Status: JobStatus,
    }
    interface ActiveJob {
        JobID: number,
        GSTID: number,
        Status: JobStatus,
        currentLat: number,
        currentLon: number,
        endLat: number,
        endLon: number,
        oldPath: any,
        remainingCoordinates: CoordPoint[]
    }
    const  currentDateTime = new Date(2021, 10, 1, 13,10,10);
    let jobData : JobData[] = [];
    const paths = new Map<number, any>();
    let distanceTravelled = 0;
    let complianceRate = 0;
    let arrivedAtJob = 0;
    let arrivedOnTime = 0;
    let timeOnJobs = 0;
    
    const updatePath = (k: number, v: any) => {
        paths.set(k, v);
    }
    const updateComplianceRate = (onTime: number, atJob: number) => {
        let totalAtJob = arrivedAtJob + atJob;
        let totalOnTime = arrivedOnTime + onTime;

        if (totalOnTime > 0) {
            complianceRate = (totalOnTime / totalAtJob) * 100;
        }

        arrivedAtJob = totalAtJob;
        arrivedOnTime= totalOnTime;
    }
    const updateTimeOnJobs = (jobTime: number) => {
        timeOnJobs = timeOnJobs + jobTime;
    }
    const updateDistance = (distance: number) => {
        distanceTravelled = distanceTravelled + distance / 1000;
    }
    const updateJob = (job: JobData) => {
        let jobs = jobData;
        let index = jobData.indexOf(job);
        jobs[index] = job;
        jobData = jobs;
    }

    function name() {
        let currentJob: JobData = {
            JobID: 401620585,
            GSTID: 500000,
            Address: "4 WALTON PL",
            Suburb: "MINCHINBURY",
            Postcode: 2770,
            StartTime: new Date(2021-10-14-56),
            IdleDuration: 0,
            TravelDuration: 25,
            JobDuration: 30,
            EndTime: new Date(2021-10-14-51-29),
            DistanceTravelled: 19019,
            Path: JSON.parse('[{"latitude":-33.84335,"longitude":150.94716},{"latitude":-33.84386,"longitude":150.94701},{"latitude":-33.84397,"longitude":150.94704},{"latitude":-33.78319,"longitude":150.82435}]'),
            Priority: "A",
            Status: "Scheduled"
        }
        return currentJob;
    }
    function activejob() {
        let activeJob:ActiveJob = {
            JobID: 401620585,
            GSTID: 500000,
            Status: "Scheduled",
            remainingCoordinates: [{latitude: 0, longitude: 0,}],
            currentLat: 1,
            currentLon: 1,
            endLat: 0,
            endLon: 0,
            oldPath: name().Path,
        };
        return activeJob;
    }
    const functionObj: FunctionObj = {
        setComplianceRate: updateComplianceRate,
        setDistanceTravelled: updateDistance,
        setTimeOnJobs: updateTimeOnJobs,
        updateJob: updateJob,
        updatePath: updatePath
    }
    const tree = render(<MapContainer><DirectionsRoute job = { activejob() } currentDateTime={currentDateTime}  functions={functionObj} /></MapContainer>);
    expect(tree).toMatchSnapshot();
});