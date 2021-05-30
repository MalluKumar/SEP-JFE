import { render, screen } from '@testing-library/react';
import  JobMap  from './Map';
import { CoordPoint, FunctionObj, JobData } from "./consts";


it('test correctly when Direction render', () => {
    const  currentDateTime = new Date(2021, 10, 1, 13,10,10);
    let jobData : JobData[] = [];
    const remainingCoordinates:CoordPoint[] = [];
    const paths = new Map<number, any>();
    const functions:FunctionObj[] = [];
    let GSTIDNumber =  401620585;
    // job[0].JobID = GSTIDNumber;
    const tree = render(<JobMap  currentDateTime={currentDateTime} jobs = {jobData} paths={paths} functions={functions[3]} />);
    expect(tree).toMatchSnapshot();
});