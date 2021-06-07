import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Clock } from './Clock';
import { JobData } from "./consts";

// test to verify if the clock is rendered correctly or not
it('test correctly when Clock render', () => {
    let currentDateTime: Date = new Date(2021, 10, 1, 13, 10, 10);
    function returnDateTime(time: Date) {
        currentDateTime = time;
    }

    const compliance = 0;
    const distance = 0;
    const timeSpentOnJob = 5;
    let jobData: JobData[] = [];

    const tree = render(<Clock jobData={jobData} currentDateTime={currentDateTime} complianceRate={compliance} distanceTravelled={distance} timeOnJobs={timeSpentOnJob} updateTime={returnDateTime} />);
    expect(tree).toMatchSnapshot();
});