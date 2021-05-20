import { Tooltip } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import FastForwardIcon from '@material-ui/icons/FastForward';
import ScheduleIcon from '@material-ui/icons/Schedule';
import TimerIcon from '@material-ui/icons/Timer';
import Slider from '@material-ui/core/Slider';
import WorkIcon from '@material-ui/icons/Work';
import React from "react";

const drawerWidth = 255;

interface IProps {
  currentDateTime: Date,
  complianceRate: number,
  distanceTravelled: number,
  timeSpentOnJob: number
  updateRate: Function
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  dateStyle: {
    marginLeft: "30px",
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginRight: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3)
  },
}));

export const Sidebar: React.FC<IProps> = ({ currentDateTime, complianceRate, distanceTravelled, timeSpentOnJob, updateRate }) => {
  const classes = useStyles();

  const handleChange = (event: any, newValue: number | number[]) => {
    updateRate(newValue);
  };

  const marks = [
    {
      value: 1,
      label: '1x',
    },
    {
      value: 2,
      label: '5x',
    },
    {
      value: 3,
      label: '15x',
    },
    {
      value: 4,
      label: '30x',
    },
    {
      value: 5,
      label: '60x',
    },
  ];

  function valuetext(value: number) {
    let label = 1;

    if (value === 1) {
      label = 1;
    }
    else if (value === 2) {
      label = 5;
    }
    else if (value === 3) {
      label = 15;
    }
    else if (value === 4) {
      label = 30;
    }
    else if (value === 5) {
      label = 60;
    }

    return label;
  }

  return (
    <div className={classes.root}>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="right"
      >
        <List>
          <ListItem>
            <Tooltip title="Date" placement="left">
              <ListItemIcon aria-label="Date">
                <CalendarTodayIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={currentDateTime.toLocaleDateString()} />
          </ListItem>
          <ListItem>
            <Tooltip title="Current Time" placement="left">
              <ListItemIcon aria-label="Current Time">
                <ScheduleIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={currentDateTime.toLocaleTimeString()} />
          </ListItem>
        </List>

        <Divider />

        <List>
          <ListItem>
            <Tooltip title="Fast Forward" placement="left">
              <ListItemIcon aria-label="Fast Forward">
                <FastForwardIcon />
              </ListItemIcon>
            </Tooltip>
            <Slider
              defaultValue={1}
              min={1}
              step={1}
              max={5}
              onChange={handleChange}
              scale={(x) => valuetext(x)}
              valueLabelDisplay="auto"
              aria-labelledby="discrete-slider-always"
              marks={marks}
            />
          </ListItem>

          <ListItem>
            <Tooltip title="Compliance Rate" placement="left">
              <ListItemIcon aria-label="Compliance Rate">
                <TimerIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={complianceRate + "% Compliance"} />
          </ListItem>

          <ListItem>
            <Tooltip title="Distance Travelled" placement="left">
              <ListItemIcon aria-label="Distance Travelled">
                <DirectionsRunIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={distanceTravelled.toFixed(2) + " KM Travelled"} />
          </ListItem>

          <ListItem>
            <Tooltip title="Time Spent Working" placement="left">
              <ListItemIcon aria-label="Time Spent Working">
                <WorkIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={timeSpentOnJob + " Mins on Job"} />
          </ListItem>
        </List>

        <Divider />

      </Drawer>
    </div>
  );
};
