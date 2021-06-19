# Jemena FWO Front End
This is a git repository created for the capstone project for Software Engineering Final Project at RMIT Semester 1 2021.
The project aims to build a visual front end web application to analyse the simulation result based on the csv file generated from the backend. The csv file outputted from the backend is manually added to the ‘public’ folder of the application code as there is not direct interlink between the backend and front-end for now.  D3 is used for reading input file once after the program runs and all the data is stored in a list and passed as props to map component.

The front-end web application will show the map of Sydney and its surrounding areas for 80% of the screen which is implemented in one component. The second component will contain a sidebar to show the date time, buttons for fast forwarding the time and other statistics which are calculated as the jobs are started and completed. The date time shown on the map is the oldest start time of a job which is in the csv. As the time ticks, the routes or movement of GST to a job location is shown on the map. Once the GST reaches the job location and starts working, distance travelled will be updated in the sidebar statistics. After the completion of the work, the work time is also updated in the sidebar. If the entire job duration exceeds the 30-minute cut-off time, then the compliance which is set to 100% is re-calculated and will be updated. The buttons on the sidebar can be used to fast forward the time. The same steps are followed until all the jobs in the csv are completed.

## Setup
The application was built using React and this needs to be installed in the machine, there is a guide link for create react installation:
https://docs.microsoft.com/en-us/windows/dev-environment/javascript/react-on-windows
The development team recommend to use Visual Studio Code for any further development. 
The Visual Studio Code is available from the following link: https://code.visualstudio.com/Download

All the external libraries are included in the package.json file. Before users try to run the project, they need to install all the libraries by type: npm install. The code can be cloned or downloaded in any editor of your choice. All the other required commands required to run the program are shown below.

## Contributors
This project is the intellectual Property of Jemena and all development work on this project should be conducted with their explicit consent. The students who contributed to this project were:

* Mallu Malligere Kumar
* Anshul Sharma
* Kunal Pahuja
* Ljubomir Antic (Julian)
* Shengping Dai

## Project Status
Development of this project has currently ceased. The current project exists as a prototype for what a final shippable product may look like.

# Other useful commands for React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
