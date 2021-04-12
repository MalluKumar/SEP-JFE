package model;

import java.time.LocalDateTime;

import com.opencsv.bean.CsvBindByName;

/**
 * @author Michael Blake
 * @author Julian Antic
 * 
 *         A class to create CompletedJobRecord objects which are records of
 *         jobs which have been assigned and completed. It takes a Job and GST
 *         object as instance variable and calls getters from those objects in
 *         its constructor
 */
public class CompletedJobRecord {

	private GST gst;
	private Job job;

	@CsvBindByName(column = "A-Job ID")
	private String createNum;
	@CsvBindByName(column = "B-GST ID")
	private String gstId;
	@CsvBindByName(column = "C-Address")
	private String address;
	@CsvBindByName(column = "D-Suburb")
	private String suburb;
	@CsvBindByName(column = "E-Postcode")
	private String postcode;
	@CsvBindByName(column = "F-Start Date Time")
	private String startDateAndTime;
	@CsvBindByName(column = "G-Idle Time mins")
	private String idleTime;
	@CsvBindByName(column = "H-Travel Time mins")
	private Integer travelTime;
	@CsvBindByName(column = "I-Job Duration mins")
	private Integer jobDuration;
	@CsvBindByName(column = "J-End Date Time")
	private LocalDateTime endDateAndTime;
	@CsvBindByName(column = "K-Distance in Meters")
	private Integer lengthInMeters;
	@CsvBindByName(column = "L-Points in Trip")
	private String points;

	/**
	 * @param gst
	 * @param job
	 */
	public CompletedJobRecord(GST gst, Job job) {
		this.gst = gst;
		this.job = job;
		this.createNum = job.getOrderNum();
		this.gstId = gst.getgSTid();
		this.address = job.getHouseNum1() + " " + job.getStreet();
		this.suburb = job.getSuburb();
		this.postcode = job.getPostcode();
		this.startDateAndTime = job.getOrderCreateDateAndTime().toString();
		this.idleTime = Long.toString(job.getIdleTime() / 60);
		this.travelTime = (job.getTravelTimeInSeconds() / 60);
		this.jobDuration = job.getJobDuration();
		this.endDateAndTime = job.getEndDateAndTime();
		this.lengthInMeters = job.getLengthInMeters();
		this.points = job.getPoints();

	}

	@Override
	public String toString() {
		return "CompletedJobRecord: [Assigned " + gst + "," + job + "]";
	}

}
