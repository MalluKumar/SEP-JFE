import { render } from '@testing-library/react';
import JobMap from './Map';
import { FunctionObj, JobData } from "./consts";

it('test correctly when Direction is rendered', () => {
    const currentDateTime = new Date(2021, 10, 1, 13, 10, 10);
    let jobData: JobData[] = [];
    const paths = new Map<number, any>();
    let distanceTravelled = 0;
    let complianceRate = 0;
    let arrivedAtJob = 0;
    let arrivedOnTime = 0;
    let timeOnJobs = 0;
    let jobsCompleted = 0;

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
        arrivedOnTime = totalOnTime;
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
    const updateCompletedJobs = (numberOfJobs: number) => {
        jobsCompleted += numberOfJobs;
    }
    const functionObj: FunctionObj = {
        setComplianceRate: updateComplianceRate,
        setDistanceTravelled: updateDistance,
        setTimeOnJobs: updateTimeOnJobs,
        updateJob: updateJob,
        updatePath: updatePath,
        updateCompletedJobs:updateCompletedJobs,
    }

    const tree = render(<JobMap currentDateTime={currentDateTime} jobs={jobData} paths={paths} functions={functionObj} />);
    expect(tree).toMatchSnapshot();
});
