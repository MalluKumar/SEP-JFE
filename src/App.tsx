import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import './App.css';
import { JobData } from './consts';
import JobMap from './Map';

const App = () => {
  // react hooks
  const [jobData, setJobData] = useState<JobData[]>([]);
  const [dateTime, setDateTime] = useState<Date>(new Date('2019-01-01')); //TODO: null this out and set in read the data in the lifecycle hook

  function castData(rawData: any[]) {
    let jobList: JobData[] = [];

    rawData.forEach(item => {
      if (item['B-GST ID']) {
        // Ignore the stats and other stuff. Probably put them in another data struct somewhere
        let currentJob: JobData = {
          JobID: item['A-JOB ID'],
          GSTID: item['B-GST ID'],
          Address: item['C-ADDRESS'],
          Suburb: item['D-SUBURB'],
          Postcode: item['E-POSTCODE'],
          StartTime: item['F-START DATE TIME'],
          IdleDuration: item['G-IDLE TIME MINS'],
          TravelDuration: item['H-TRAVEL TIME MINS'],
          JobDuration: item['I-JOB DURATION MINS'],
          EndTime: item['J-END DATE TIME'],
          DistanceTravelled: item['K-DISTANCE IN METERS'],
          Path: JSON.parse(item['L-POINTS IN TRIP']),
        };
        jobList.push(currentJob);
      }
    });

    // Grab the first date, probably rewrite this or sort the array depending on your needs
    var lowest: Date = new Date('2000-01-01'); //Do as I say, not as I do
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
    d3.csv(`${process.env.PUBLIC_URL}/data1.csv`)
      .then(function (data: any): void {
        castData(data);
      })
      .catch(function (err) {
        throw err;
      });
  }, []);

  function startTime(today: any) {
    const date = new Date(today);
    var d = date.getDate();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    const clock: any = document.getElementById('txt');
    clock.innerHTML = ' D :  H :  M :  S <br/>' + d + ' : ' + h + ' : ' + m + ' : ' + s;
    var t = setTimeout(function () {
      startTime(new Date(date.getTime() + 1000));
    }, 1000);

    if (date.getTime() >= new Date(jobData[4].EndTime).getTime()) {
  
      clearTimeout(t);
    }
  }
  function checkTime(i: any) {
    if (i < 10) {
      i = '0' + i;
    } // add zero in front of numbers < 10
    return i;
  }
  if (document.getElementById('txt') && jobData && jobData.length > 0) {
    console.log(jobData[0].StartTime);
    startTime(jobData[0].StartTime);
  }
  return (
    <div>
      <div
        style={{
          position: 'fixed',
          zIndex: 999,
          right: '2vw',
          top: '2vh',
          fontSize: '25px',
        }}
      >
        <div id="txt"></div>
      </div>
      <JobMap currentDateTime={dateTime} jobs={jobData} />
      <button
        onClick={e => {
          console.log(jobData);
        }}
      >
        Show State Data{' '}
      </button>
    </div>
  );
};

export default App;
