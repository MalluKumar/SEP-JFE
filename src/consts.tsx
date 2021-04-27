export interface JobData {
    JobID: number,
    GSTID: number,
    Address: string,
    Suburb: string,
    Postcode: number,
    StartTime: Date,
    IdleDuration: number,
    TravelDuration: number,
    JobDuration: number,
    EndTime: Date,
    DistanceTravelled: number,
    Path: CoordPoint[]
}

export type JobStatus = "Complete" | "Incomplete"

export interface CoordPoint {
    latitude: number,
    longitude: number,
}

export interface Job {
    lat: number,
    lon: number,
    status: JobStatus
}

export interface IClockProps {
    currentDateTime: Date,    
  }