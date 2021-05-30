import { render, screen } from '@testing-library/react';
import { Clock } from './Clock';
import { JobData } from "./consts";


it('test correctly when Clock render', () => {
    const  currentDateTime = new Date(2021, 10, 1, 13,10,10);
    const  compliance = 0;
    const  distance = 0;
    const  timeSpentOnJob = 5;
    let jobData : JobData[] = [];
    const tree = render(<Clock jobData = {jobData} currentDateTime={currentDateTime} compliance={compliance} distance={distance} timeSpentOnJob={timeSpentOnJob} updateTime={jest.fn()}/>);
    expect(tree).toMatchSnapshot();
});