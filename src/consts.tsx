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
    Path: CoordPoint[],
    Priority: string,
    Status: JobStatus,
}

export interface JobDict<JobData> {
    JobID: number,
    Value: JobData
}

export type JobStatus = "Complete" | "In Progress" | "Travelling" | "Inactive" | "Scheduled"

export interface CoordPoint {
    latitude: number,
    longitude: number,
}

export interface Job {
    JobID: number,
    GSTID: number,
    currentLat: number,
    currentLon: number,
    endLat: number,
    endLon: number,
    directionArray: number[][],
}

export interface FunctionObj {
    updateDistance: Function,
    updateTimeSpentOnJob: Function,
    updateJob: Function,
    updatePath: Function,
    updateComplianceRate: Function
}
