import * as d3 from "d3";
import { useEffect, useState } from 'react';
import './App.css';
import { Clock } from "./Clock";
import { FunctionObj, JobData } from './consts';
import JobMap from './Map';

const App = () => {
    // react hooks
    const [jobData, setJobData] = useState<JobData[]>([]);
    const [dateTime, setDateTime] = useState<Date>(new Date());
    const [paths, setPath] = useState(new Map<number, any>());
    const [distanceTravelled, setDistance] = useState<number>(0);
    const [complianceRate, setCompliance] = useState<number>(100);
    const [jobsOnTime, setJobsOnTime] = useState<number>(0);
    const [timeSpentOnJob, setTimeSpentOnJob] = useState<number>(0);

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
        setDistance(distanceTravelled + (Number(distance) / 1000));
    }

    const updateTimeSpentOnJob = (jobTime: number) => {
        setTimeSpentOnJob(timeSpentOnJob + Number(jobTime));
    }

    const updateComplianceRate = (exceedsCompliance: boolean) => {
        let onTimeJobs = jobsOnTime;

        if (exceedsCompliance) {
            onTimeJobs -= 1;
            setJobsOnTime(onTimeJobs);
        }

        setCompliance((onTimeJobs / jobData.length) * 100);
    }

    const functionObj: FunctionObj = {
        updateDistance: updateDistance,
        updateTimeSpentOnJob: updateTimeSpentOnJob,
        updateJob: updateJob,
        updatePath: updatePath,
        updateComplianceRate: updateComplianceRate
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

        var lowest: Date = new Date(new Date().getUTCFullYear(), 12, 31);
        var tmp;

        for (var i = jobList.length - 1; i >= 0; i--) {
            tmp = jobList[i].StartTime;
            if (tmp < lowest) lowest = tmp;
        }

        setDateTime(lowest);
        setJobData(jobList);
        setJobsOnTime(jobList.length);
    }

    useEffect(() => {
        // d3 for reading csv
        d3.csv(`${process.env.PUBLIC_URL}/data1.csv`).then(function (data: any): void {
            castData(data);
        }).catch(function (err) {
            throw err;
        })
    }, []);

    return (
        <div>
            <JobMap currentDateTime={dateTime} jobs={jobData} functions={functionObj} paths={paths} />
            <Clock jobData={jobData} currentDateTime={dateTime} updateTime={setDateTime} compliance={complianceRate} distance={distanceTravelled} timeSpentOnJob={timeSpentOnJob} />
            {/* <button id="button" onClick={(e) => { console.log(jobData) }} >Show State Data</button> */}
        </div>
    );
}

export default App;
