import * as d3 from "d3";
import React, { useEffect, useState } from 'react';
import './App.css';
import { Clock } from "./Clock";
import { JobData } from './consts';
import JobMap from './Map';

const App = () => {
    // react hooks
    const [jobData, setJobData] = useState<JobData[]>([]);
    const [dateTime, setDateTime] = useState<Date>(new Date()); //TODO: null this out and set in read the data in the lifecycle hook

    function castData(rawData: any[]) {
        let jobList: JobData[] = [];

        rawData.forEach(item => {
            if (item["B-GST ID"]) { // Ignore the stats and other stuff. Probably put them in another data struct somewhere
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
                    Path: JSON.parse(item["L-POINTS IN TRIP"])
                }
                jobList.push(currentJob)
            }
        });

        // Grab the first date, probably rewrite this or sort the array depending on your needs
        var lowest: Date = new Date(new Date().getUTCFullYear(), 12, 31);  //Do as I say, not as I do
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
        d3.csv(`${process.env.PUBLIC_URL}/data1.csv`).then(function (data: any): void {
            castData(data);
        }).catch(function (err) {
            throw err;
        })
    }, []);

    return (
        <div>
            <Clock currentDateTime={dateTime} updateTime={setDateTime} />
            <JobMap currentDateTime={dateTime} jobs={jobData} />
            <button onClick={(e) => { console.log(jobData) }} >Show State Data</button>
        </div>
    );
}

export default App;
