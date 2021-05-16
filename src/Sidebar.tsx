import { Button, ButtonGroup, Tooltip } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from '@material-ui/icons/Add';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import FastForwardIcon from '@material-ui/icons/FastForward';
import RemoveIcon from '@material-ui/icons/Remove';
import ScheduleIcon from '@material-ui/icons/Schedule';
import TimerIcon from '@material-ui/icons/Timer';
import React from "react";

const drawerWidth = 255;

interface IProps {
  currentDateTime: Date,
  complianceRate: number,
  distanceTravelled: number,
  rate: number,
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

export const Sidebar: React.FC<IProps> = ({ currentDateTime, complianceRate, distanceTravelled, rate, updateRate }) => {
  const classes = useStyles();

  function FastForward() {
    updateRate(rate + 1);
  }

  function FastRewind() {
    updateRate(rate - 1);
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
        {/* <h2 className={classes.dateStyle}>
          {currentDateTime && currentDateTime.toLocaleDateString()}
          <br />
          {currentDateTime && currentDateTime.toLocaleTimeString()}
        </h2> */}
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
            <ButtonGroup aria-label="small outlined button group">
              <Button disabled={rate === 1} onClick={() => { FastRewind() }}><RemoveIcon /></Button>
              <Button disabled={rate === 5} onClick={() => { FastForward() }}><AddIcon /></Button>
            </ButtonGroup>
          </ListItem>

          <ListItem>
            <Tooltip title="Compliance Rate" placement="left">
              <ListItemIcon aria-label="Compliance Rate">
                <TimerIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={complianceRate + "%"} />
          </ListItem>

          <ListItem>
            <Tooltip title="Distance Travelled" placement="left">
              <ListItemIcon aria-label="Distance Travelled">
                <DirectionsRunIcon />
              </ListItemIcon>
            </Tooltip>
            <ListItemText primary={distanceTravelled.toFixed(2) + " KM"} />
          </ListItem>
        </List>

        <Divider />

      </Drawer>
    </div>
  );
};
