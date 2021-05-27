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

export type JobStatus = "Complete" | "In Progress" | "Travelling" | "Scheduled"

export interface CoordPoint {
    latitude: number,
    longitude: number,
}

export interface ActiveJob {
    JobID: number,
    GSTID: number,
    Status: JobStatus,
    currentLat: number,
    currentLon: number,
    endLat: number,
    endLon: number,
    oldPath: any,
    remainingCoordinates: CoordPoint[]
}

export interface FunctionObj {
    setComplianceRate: Function
    setDistanceTravelled: Function,
    setTimeOnJobs: Function,
    updateJob: Function,
    updatePath: Function,

}
