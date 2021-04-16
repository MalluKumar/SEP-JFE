import React, {useEffect} from 'react';
import './App.css';
import {MapContainer, TileLayer, Circle, Marker, Popup} from 'react-leaflet'
import * as d3 from "d3";
// import data from './data.csv';

const App = () => {
    // react hooks 
    const [middlePoints, setMiddlePoints] = React.useState(null);
    const [first, setFirst] = React.useState(null);
    const [last, setLast] = React.useState(null);
    const [date, setDate] = React.useState(null);
    const [time, setTime] = React.useState(null);

    useEffect(() => {
// d3 for reading csv
        d3.csv(`${process.env.PUBLIC_URL}/data.csv`).then(function (data: any): void {
            // get date and time from csv
            const dateAndTime = data[0]['F-START DATE TIME'];
            // get lat lng data from csv
            const LatLngData = JSON.parse(data[0]['L-POINTS IN TRIP']);
            // make length variable of lat lng data.
            const n = LatLngData.length;
            // split and set date
            setDate(dateAndTime.split('T')[0])
            // split and set time
            setTime(dateAndTime.split('T')[1])
            // set starting marker data
            setFirst(LatLngData[0]);
            // set last marker data
            setLast(LatLngData[n - 1]);
            // remove first and last elemet from existing data
            LatLngData.shift();  // Removes the first element from an array and returns only that element.
            LatLngData.pop();
            // set middle point/circles data
            setMiddlePoints(LatLngData);
            // console.log(n, LatLngData);
        }).catch(function (err) {
            throw err;
        })

    }, []);

    return (
        <MapContainer id="container" center={[-33.900, 151.150]} zoom={15} scrollWheelZoom={true}>
            <p style={{position: 'absolute', top: 5, right: 5, zIndex: 1000, fontSize: 16, fontWeight: "bold"}}>{`Date: ${date}, Time: ${time}`}</p>
            <TileLayer
                attribution='&copy; <a href="&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"/>
            {/*// @ts-ignore*/}
            {/* frist marker */}
            {first && <Marker position={[first.latitude, first.longitude]}></Marker>}
            {/*// @ts-ignore*/}
            {/* middle points circles */}
            {middlePoints && middlePoints.map(function (e: any) {
                // return
                return <Circle
                    center={{lat: e.latitude, lng: e.longitude}}
                    fillColor="red"
                    fillOpacity={1}
                    color={"red"}
                    opacity={1}
                    radius={5}/>
            })
            }
            {/*// @ts-ignore*/}
            {/* last marker */}
            {last && <Marker position={[last.latitude, last.longitude]}></Marker>}
        </MapContainer>
    );
}

export default App;
