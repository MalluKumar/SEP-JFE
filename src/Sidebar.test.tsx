
import { render, screen } from '@testing-library/react';
import { Sidebar} from './Sidebar';


it('test correctly when Sidebar render', () => {
    let rate = 1;
    const  currentDateTime = new Date(2021, 10, 1, 13,10,10);
    const  complianceRate = 100;
    const  distanceTravelled = 0;
    const  timeSpentOnJob = 5;
    const  updateRate = (speed: number) => {
      return;
    };
    const tree = render(<Sidebar currentDateTime={currentDateTime} complianceRate={complianceRate} distanceTravelled={distanceTravelled} timeSpentOnJob={timeSpentOnJob} updateRate={updateRate}/>);
    expect(tree).toMatchSnapshot();
});