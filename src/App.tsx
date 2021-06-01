import * as d3 from "d3";
import { useEffect, useState } from 'react';
import './App.css';
import { Clock } from "./Clock";
import { FunctionObj, JobData } from './consts';
import JobMap from './Map';

const App = () => {

    // Holds the job data loaded from CSV
    const [jobData, setJobData] = useState<JobData[]>([]);
    // The current time in the simulation
    const [dateTime, setDateTime] = useState<Date>(new Date());
    // The paths currently displayed on the map
    const [paths, setPath] = useState(new Map<number, any>());
    // The total distance travelled in the simulation
    const [distanceTravelled, setDistanceTravelled] = useState<number>(0);
    // Number of jobs that arrived at the job < 30 minutes
    const [arrivedOnTime, setArrivedOnTime] = useState<number>(0);
    // Total number of GSTS that arrived at a job
    const [arrivedAtJob, setArrivedAtJob] = useState<number>(0);
    // The compliance rate over the course of the simulation
    const [complianceRate, setComplianceRate] = useState<number>(0);
    // Total time spent working on jobs
    const [timeOnJobs, setTimeOnJobs] = useState<number>(0);
    // Total number of Jobs completed
    const [jobsCompleted, setJobsCompleted] = useState<number>(0);

    // Helper methods
    const updateJob = (job: JobData) => {
        let jobs = jobData;
        let index = jobData.indexOf(job);
        jobs[index] = job;

        setJobData(jobs);
    }

    const updatePath = (k: number, v: any) => {
        setPath(paths.set(k, v));
    }

    const updateDistance = (distance: number) => {
        setDistanceTravelled(distanceTravelled + (Number(distance) / 1000));
    }

    const updateComplianceRate = (onTime: number, atJob: number) => {
        let totalAtJob = arrivedAtJob + atJob;
        let totalOnTime = arrivedOnTime + onTime;

        if (totalOnTime > 0) {
            setComplianceRate(Number((totalOnTime / totalAtJob)) * 100);
        }

        setArrivedAtJob(totalAtJob);
        setArrivedOnTime(totalOnTime);
    }

    const updateTimeOnJobs = (jobTime: number) => {
        setTimeOnJobs(timeOnJobs + Number(jobTime));
    }

    const updateCompletedJobs = (numberOfJobs: number) => {
        setJobsCompleted(jobsCompleted + Number(numberOfJobs));
    }

    const functionObj: FunctionObj = {
        setComplianceRate: updateComplianceRate,
        setDistanceTravelled: updateDistance,
        setTimeOnJobs: updateTimeOnJobs,
        updateJob: updateJob,
        updatePath: updatePath,
        updateCompletedJobs: updateCompletedJobs
    }

    function castData(rawData: any[]) {
        let jobList: JobData[] = [];

        rawData.forEach(item => {
            if (item["B-GST ID"]) {
                let currentJob: JobData = {
                    JobID: item["A-JOB ID"],
                    GSTID: item["B-GST ID"],
                    Address: item["C-ADDRESS"],
                    Suburb: item["D-SUBURB"],
                    Postcode: item["E-POSTCODE"],
                    StartTime: new Date(item["F-START DATE TIME"]),
                    IdleDuration: item["G-IDLE TIME MINS"],
                    TravelDuration: item["H-TRAVEL TIME MINS"],
                    JobDuration: item["I-JOB DURATION MINS"],
                    EndTime: new Date(item["J-END DATE TIME"]),
                    DistanceTravelled: item["K-DISTANCE IN METERS"],
                    Path: JSON.parse(item["L-POINTS IN TRIP"]),
                    Priority: item["M-JOB PRIORITY"],
                    Status: "Scheduled"
                }

                jobList.push(currentJob);
            }
        });

        var lowest: Date = new Date(new Date().getUTCFullYear(), 11, 31);
        var tmp;

        for (var i = jobList.length - 1; i >= 0; i--) {
            tmp = jobList[i].StartTime;
            if (tmp < lowest) lowest = tmp;
        }

        setDateTime(lowest);
        setJobData(jobList);
    }

    useEffect(() => {
        // d3 for reading csv
        d3.csv(`${process.env.PUBLIC_URL}/data2.csv`).then(function (data: any): void {
            castData(data);
        }).catch(function (err) {
            throw err;
        })
    }, []);

    return (
        <div>
            <JobMap currentDateTime={dateTime} jobs={jobData} functions={functionObj} paths={paths} />
            <Clock jobData={jobData} currentDateTime={dateTime} updateTime={setDateTime} complianceRate={complianceRate} distanceTravelled={distanceTravelled} timeOnJobs={timeOnJobs} jobsCompleted={jobsCompleted} />
        </div>
    );
}

export default App;
