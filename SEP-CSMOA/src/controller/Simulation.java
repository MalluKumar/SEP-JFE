package controller;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.Iterator;
import java.util.PriorityQueue;

import org.locationtech.jts.geom.Coordinate;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.opencsv.exceptions.CsvDataTypeMismatchException;
import com.opencsv.exceptions.CsvRequiredFieldEmptyException;

import model.CompletedJobRecord;
import model.GST;
import model.Job;

/**
 * @author Michael Blake
 * @author Clark Skinner
 * @author Julian Antic
 * 
 *         Main class which handles the running of the simulation. It utilises
 *         methods from the SimUtils class to trigger the creation of jobs in
 *         the simulation, allocate GSTs to jobs, complete jobs and generate
 *         records for completed jobs in the from of CompletedJobRecord objects.
 * 
 */
public class Simulation {

	// Queue storage for jobs
	private PriorityQueue<Job> jobQueue = new PriorityQueue<Job>();

	// Deque storage for jobs waiting to be added to the active Queue when there is
	// no GST available
	private Deque<Job> idleJobQueue = new ArrayDeque<Job>();

	// Store completed jobs
	private ArrayList<CompletedJobRecord> completedJobs = new ArrayList<CompletedJobRecord>();

	// ArrayList of currently available GSTs
	private ArrayList<GST> availableGSTPool = new ArrayList<GST>();

	// ArrayList of currently busy GSTs
	private ArrayList<GST> busyGSTs = new ArrayList<GST>();

	// Strings representing filenames to pass as arguments in cmdline
	private String JOB_FILE_PATH;

	private String GST_FILE_PATH;

	private String LOG_FILE_JOB;

	private String LOG_FILE_GST;

	// An Integer representing the required compliance time in seconds
	private final int COMPLIANCE_TIME = 1800;

	// LocalDate object referencing the next day in the simulation
	private LocalDate nextDay;

	/**
	 * Main simulation method. Accepts two LocalDateTime objects as arguments which
	 * represent the start and end of the simulation. The Simulation progresses
	 * second by second, checking the job pool to see if the time matches the start
	 * time of a job. If it does, the method checks whether a GST is currently
	 * available to be assigned the job. If no GST is available the job will enter
	 * the idleQueue and be next in line when a GST becomes available. If a GST is
	 * available then the job enters the jobQueue and is assigned the closest
	 * available GST based on a call to the Azure Maps API. Once a job is assigned
	 * an endDateAndTime will be set which the method then uses to check when to end
	 * the job and move it to the completedJobs Array. The simulation will
	 * automatically terminate when all jobs from the jobPool have been completed
	 * and there are no busy GSTs.
	 * 
	 * @throws IOException
	 * @throws SecurityException
	 * @throws CsvRequiredFieldEmptyException
	 * @throws CsvDataTypeMismatchException
	 * @throws InterruptedException
	 */

	private void simulate(LocalDateTime currentTime, LocalDateTime endTime) throws SecurityException, IOException,
	CsvDataTypeMismatchException, CsvRequiredFieldEmptyException, InterruptedException {

		int complianceCounter = 0;
		long totalTravelTime = 0;
		long jobIdleTime = 0;
		LocalDate thisDay = currentTime.toLocalDate();
		LocalTime GSTstartTime = LocalTime.of(7, 0);
		nextDay = null;

		availableGSTPool = GSTFactory.getNextGSTs(thisDay);
		ArrayList<Job> jobPool = JobFactory.getJobPool();
		do {
			thisDay = currentTime.toLocalDate();
			if (currentTime.toLocalTime().equals(GSTstartTime)) {
				checkDay(thisDay, nextDay);
			}
			int availableGSTs = availableGSTPool.size();
			for (Iterator<Job> jobPoolIter = jobPool.iterator(); jobPoolIter.hasNext();) {
				Job j = jobPoolIter.next();

				if (currentTime.equals(j.getOrderCreateDateAndTime()) && availableGSTs == 0) {
					idleJobQueue.addLast(j);
				}
				if (!idleJobQueue.isEmpty() && availableGSTs > 0) {
					Iterator<Job> iter = idleJobQueue.iterator();
					iter.hasNext();
					{
						Job current = iter.next();
						jobIdleTime = SimUtils.calculateTimeBetween(current.getOrderCreateDateAndTime(), currentTime);
						current.setIdleTime(jobIdleTime);
						jobQueue.add(current);
						jobPoolIter.remove();
						iter.remove();
						break;
					}

				} else if (currentTime.equals(j.getOrderCreateDateAndTime()) && availableGSTs > 0
						&& idleJobQueue.isEmpty()) {
					jobQueue.add(j);
					jobPoolIter.remove();
				}

			}

			if (jobQueue.size() > 0) {
				for (Job j : jobQueue) {
					if (j.getAssignedGST() == null) {
						Coordinate jobCoord = SimUtils.getJobLocation(j);
						LocalDateTime jobTime = j.getOrderCreateDateAndTime();
						int jobDuration = j.getJobDuration();
						GST gst = SimUtils.findClosestGst(jobCoord, COMPLIANCE_TIME, jobTime, availableGSTPool);
						int travelTime = 0;
						int lengthInMeters = 0;
						String points = "";
						if (gst != null) {
							System.out.println("Found the closest GST: " + gst.getgSTid() + " in 30min isochrone.");
							Coordinate gstCoord = new Coordinate(gst.getLat(), gst.getLon());

							JsonArray legs = AzureMapsApi.getRouteInfo(gstCoord, jobCoord, currentTime);

							// Gets Summary object from the legs array
							JsonElement summary = ((JsonObject) legs.get(0)).get("summary");

							// Get results from Azure response
							lengthInMeters = summary.getAsJsonObject().getAsJsonPrimitive("lengthInMeters").getAsInt();
							travelTime = summary.getAsJsonObject().getAsJsonPrimitive("travelTimeInSeconds").getAsInt();

							// Gets the points array from the legs array as a string
							points = ((JsonObject) legs.get(0)).get("points").toString();

							if ((travelTime + j.getIdleTime()) < COMPLIANCE_TIME) {
								complianceCounter++;
							}

							System.out.println("Travel Time is: " + SimUtils.formatSeconds(travelTime) + "\n");
							j.setTravelTimeInSeconds(travelTime);
							j.setLengthInMeters(lengthInMeters);
							j.setPoints(points);

							j.setEndDateAndTime(
									jobTime.plusMinutes(jobDuration).plusSeconds(travelTime).plusSeconds(jobIdleTime));
							totalTravelTime = totalTravelTime + travelTime;
							j.setAssignedGST(gst);

							// Set the time that the GST will become available again
							// Reapply the travel time to simulate a GST returning to their previous
							// position
							gst.setFinishTime(j.getEndDateAndTime().plusSeconds(travelTime));
							availableGSTPool.remove(gst);
							busyGSTs.add(gst);

						} else if (gst == null && !availableGSTPool.isEmpty()) {
							gst = SimUtils.findGstByStraightLineDistance(jobCoord, availableGSTPool);
							System.out.println("Found the closest GST: " + gst.getgSTid() + " outside isochrone");
							Coordinate gstCoord = new Coordinate(gst.getLat(), gst.getLon());

							JsonArray legs = AzureMapsApi.getRouteInfo(gstCoord, jobCoord, currentTime);

							// Gets Summary object from the legs array
							JsonElement summary = ((JsonObject) legs.get(0)).get("summary");

							// Get results from Azure response
							lengthInMeters = summary.getAsJsonObject().getAsJsonPrimitive("lengthInMeters").getAsInt();
							travelTime = summary.getAsJsonObject().getAsJsonPrimitive("travelTimeInSeconds").getAsInt();

							// Gets the points array from the legs array as a string
							points = ((JsonObject) legs.get(0)).get("points").toString();

							if ((travelTime + j.getIdleTime()) < COMPLIANCE_TIME) {
								complianceCounter++;
							}
							System.out.println("Travel Time is: " + SimUtils.formatSeconds(travelTime) + "\n");
							j.setTravelTimeInSeconds(travelTime);
							j.setLengthInMeters(lengthInMeters);
							j.setPoints(points);

							// Set the finishing time for the job
							j.setEndDateAndTime(
									jobTime.plusMinutes(jobDuration).plusSeconds(travelTime).plusSeconds(jobIdleTime));
							totalTravelTime = totalTravelTime + travelTime;
							j.setAssignedGST(gst);

							// Set the time that the GST will become available again
							// Reapply the travel time to simulate a GST returning to their previous
							// position
							gst.setFinishTime(j.getEndDateAndTime().plusSeconds(travelTime));
							availableGSTPool.remove(gst);
							busyGSTs.add(gst);

						}

					}

				}
			}
			SimUtils.removeCompletedJobFromQueue(currentTime, jobQueue, completedJobs);
			SimUtils.checkGstFinished(currentTime, availableGSTPool, busyGSTs);
			currentTime = currentTime.plusSeconds(1);
			if (jobPool.isEmpty() && jobQueue.isEmpty() && busyGSTs.isEmpty()) {
				endTime = currentTime;
			}

		} while (currentTime.isBefore(endTime));
		int jobsCompleted = completedJobs.size();
		int incompleteJobs = idleJobQueue.size() + jobQueue.size();
		if (jobsCompleted == 0) {
			System.err.println("No Completed Jobs");
		} else {
			long avgTravelTime = totalTravelTime / jobsCompleted;
			float complianceRate = (float) complianceCounter / (jobsCompleted + incompleteJobs) * 100;

			SimUtils.generateOutput(avgTravelTime, complianceRate, incompleteJobs, completedJobs,
					SimUtils.getOverallGstStats(GSTFactory.getGSTpool()), LOG_FILE_JOB, LOG_FILE_GST);
		}

	}

	private void runSimulation() throws SecurityException, IOException, CsvDataTypeMismatchException,
	CsvRequiredFieldEmptyException, InterruptedException {
		JobFactory.readJobsFromCSV(JOB_FILE_PATH);
		GSTFactory.readGSTsFromCSV(GST_FILE_PATH);
		LocalDateTime firstJob = JobFactory.getJobPool().get(0).getOrderCreateDateAndTime();
		LocalTime startTime = LocalTime.of(7, 0);
		LocalDateTime startDate = LocalDateTime.of(firstJob.toLocalDate(), startTime);
		LocalDateTime endDate = JobFactory.getJobPool().get(JobFactory.getJobPool().size() - 1)
				.getOrderCreateDateAndTime().plusDays(1);
		simulate(startDate, endDate);

	}

	private void initFileNames(String jobFile, String gstFile, String outputjobs, String outputgst) {
		JOB_FILE_PATH = jobFile;
		GST_FILE_PATH = gstFile;
		LOG_FILE_JOB = outputjobs;
		LOG_FILE_GST = outputgst;

	}

	private void checkDay(LocalDate currThisDay, LocalDate currNextDay) {
		if (currNextDay == null) {
			nextDay = currThisDay.plusDays(1);
		} else if (currThisDay.compareTo(currNextDay) == 0) {
			availableGSTPool.clear();
			availableGSTPool = GSTFactory.getNextGSTs(currThisDay);
			nextDay = currThisDay.plusDays(1);
		}
	}

	public static void main(String[] args) throws SecurityException, IOException, CsvDataTypeMismatchException,
	CsvRequiredFieldEmptyException, InterruptedException {

		Simulation s = new Simulation();
		if (args.length == 4) {
			s.initFileNames(args[0], args[1], args[2], args[3]);
		}

		s.initFileNames("C:/Users/JulZ/Repositories/SEP/SEP-CSMOA-dev/JobFiles/1job.csv",
				"C:/Users/JulZ/Repositories/SEP/SEP-CSMOA-dev/GSTFiles/gsts1.csv",
				"C:/Users/JulZ/Repositories/SEP/SEP-CSMOA-dev/JobOutput.csv",
				"C:/Users/JulZ/Repositories/SEP/SEP-CSMOA-dev/GSTOutput.csv");
		String json = "{\"routes\":[{\"summary\":{\"lengthInMeters\":38085,\"travelTimeInSeconds\":2504,\"trafficDelayInSeconds\":0,\"trafficLengthInMeters\":0,\"departureTime\":\"2021-10-14T01:56:00+00:00\",\"arrivalTime\":\"2021-10-14T02:37:43+00:00\"},\"legs\":[{\"summary\":{\"lengthInMeters\":38085,\"travelTimeInSeconds\":2504,\"trafficDelayInSeconds\":0,\"trafficLengthInMeters\":0,\"departureTime\":\"2021-10-14T01:56:00+00:00\",\"arrivalTime\":\"2021-10-14T02:37:43+00:00\"},\"points\":[{\"latitude\":-33.91646,\"longitude\":151.1557},{\"latitude\":-33.91625,\"longitude\":151.15535},{\"latitude\":-33.9162,\"longitude\":151.15526},{\"latitude\":-33.91595,\"longitude\":151.15499},{\"latitude\":-33.91571,\"longitude\":151.15468},{\"latitude\":-33.91532,\"longitude\":151.15417},{\"latitude\":-33.91475,\"longitude\":151.15339},{\"latitude\":-33.91463,\"longitude\":151.15323},{\"latitude\":-33.91436,\"longitude\":151.15288},{\"latitude\":-33.91426,\"longitude\":151.15276},{\"latitude\":-33.91398,\"longitude\":151.15294},{\"latitude\":-33.91385,\"longitude\":151.15302},{\"latitude\":-33.91376,\"longitude\":151.15307},{\"latitude\":-33.9137,\"longitude\":151.15311},{\"latitude\":-33.91359,\"longitude\":151.15318},{\"latitude\":-33.91354,\"longitude\":151.15321},{\"latitude\":-33.91297,\"longitude\":151.15235},{\"latitude\":-33.9129,\"longitude\":151.15224},{\"latitude\":-33.91286,\"longitude\":151.1521},{\"latitude\":-33.91281,\"longitude\":151.15196},{\"latitude\":-33.9125,\"longitude\":151.15094},{\"latitude\":-33.91249,\"longitude\":151.15092},{\"latitude\":-33.91248,\"longitude\":151.15091},{\"latitude\":-33.91247,\"longitude\":151.1509},{\"latitude\":-33.91245,\"longitude\":151.15088},{\"latitude\":-33.91241,\"longitude\":151.15085},{\"latitude\":-33.91221,\"longitude\":151.15072},{\"latitude\":-33.91144,\"longitude\":151.15026},{\"latitude\":-33.91121,\"longitude\":151.15012},{\"latitude\":-33.91095,\"longitude\":151.14996},{\"latitude\":-33.91085,\"longitude\":151.1499},{\"latitude\":-33.91075,\"longitude\":151.14984},{\"latitude\":-33.91073,\"longitude\":151.1499},{\"latitude\":-33.91051,\"longitude\":151.15046},{\"latitude\":-33.91036,\"longitude\":151.15084},{\"latitude\":-33.91031,\"longitude\":151.15092},{\"latitude\":-33.91006,\"longitude\":151.15123},{\"latitude\":-33.91,\"longitude\":151.15129},{\"latitude\":-33.90964,\"longitude\":151.15159},{\"latitude\":-33.909,\"longitude\":151.15213},{\"latitude\":-33.90868,\"longitude\":151.15239},{\"latitude\":-33.90863,\"longitude\":151.15242},{\"latitude\":-33.90856,\"longitude\":151.15245},{\"latitude\":-33.90831,\"longitude\":151.15251},{\"latitude\":-33.90825,\"longitude\":151.15253},{\"latitude\":-33.90775,\"longitude\":151.15265},{\"latitude\":-33.90729,\"longitude\":151.15277},{\"latitude\":-33.90679,\"longitude\":151.1529},{\"latitude\":-33.90639,\"longitude\":151.15299},{\"latitude\":-33.90607,\"longitude\":151.15307},{\"latitude\":-33.90563,\"longitude\":151.15311},{\"latitude\":-33.90509,\"longitude\":151.15315},{\"latitude\":-33.90473,\"longitude\":151.15317},{\"latitude\":-33.90451,\"longitude\":151.15319},{\"latitude\":-33.9044,\"longitude\":151.1532},{\"latitude\":-33.90407,\"longitude\":151.15322},{\"latitude\":-33.90381,\"longitude\":151.15324},{\"latitude\":-33.90364,\"longitude\":151.15325},{\"latitude\":-33.90333,\"longitude\":151.15327},{\"latitude\":-33.90204,\"longitude\":151.15336},{\"latitude\":-33.9019,\"longitude\":151.15337},{\"latitude\":-33.90175,\"longitude\":151.15339},{\"latitude\":-33.9015,\"longitude\":151.15342},{\"latitude\":-33.9012,\"longitude\":151.15345},{\"latitude\":-33.90107,\"longitude\":151.15346},{\"latitude\":-33.90066,\"longitude\":151.15345},{\"latitude\":-33.90046,\"longitude\":151.15347},{\"latitude\":-33.89948,\"longitude\":151.15353},{\"latitude\":-33.89889,\"longitude\":151.15357},{\"latitude\":-33.89826,\"longitude\":151.15362},{\"latitude\":-33.89792,\"longitude\":151.15364},{\"latitude\":-33.89759,\"longitude\":151.15366},{\"latitude\":-33.89751,\"longitude\":151.15364},{\"latitude\":-33.8974,\"longitude\":151.15361},{\"latitude\":-33.89729,\"longitude\":151.15356},{\"latitude\":-33.8972,\"longitude\":151.15348},{\"latitude\":-33.89712,\"longitude\":151.15339},{\"latitude\":-33.89701,\"longitude\":151.15325},{\"latitude\":-33.89677,\"longitude\":151.15283},{\"latitude\":-33.89659,\"longitude\":151.15253},{\"latitude\":-33.89652,\"longitude\":151.15243},{\"latitude\":-33.89649,\"longitude\":151.1524},{\"latitude\":-33.89646,\"longitude\":151.15238},{\"latitude\":-33.89615,\"longitude\":151.15219},{\"latitude\":-33.89597,\"longitude\":151.15209},{\"latitude\":-33.89549,\"longitude\":151.15179},{\"latitude\":-33.89531,\"longitude\":151.15167},{\"latitude\":-33.89515,\"longitude\":151.15157},{\"latitude\":-33.89487,\"longitude\":151.1514},{\"latitude\":-33.89461,\"longitude\":151.15124},{\"latitude\":-33.89455,\"longitude\":151.15121},{\"latitude\":-33.89436,\"longitude\":151.15109},{\"latitude\":-33.89431,\"longitude\":151.15103},{\"latitude\":-33.89428,\"longitude\":151.151},{\"latitude\":-33.89425,\"longitude\":151.15095},{\"latitude\":-33.89423,\"longitude\":151.15091},{\"latitude\":-33.89422,\"longitude\":151.15088},{\"latitude\":-33.89421,\"longitude\":151.15081},{\"latitude\":-33.8942,\"longitude\":151.15076},{\"latitude\":-33.89412,\"longitude\":151.1502},{\"latitude\":-33.89408,\"longitude\":151.1499},{\"latitude\":-33.89407,\"longitude\":151.14986},{\"latitude\":-33.89397,\"longitude\":151.14988},{\"latitude\":-33.89394,\"longitude\":151.1499},{\"latitude\":-33.89384,\"longitude\":151.14997},{\"latitude\":-33.89369,\"longitude\":151.15008},{\"latitude\":-33.89342,\"longitude\":151.15027},{\"latitude\":-33.89326,\"longitude\":151.15038},{\"latitude\":-33.89325,\"longitude\":151.15039},{\"latitude\":-33.89322,\"longitude\":151.15039},{\"latitude\":-33.89321,\"longitude\":151.15039},{\"latitude\":-33.89317,\"longitude\":151.15039},{\"latitude\":-33.89315,\"longitude\":151.15038},{\"latitude\":-33.89299,\"longitude\":151.15028},{\"latitude\":-33.89285,\"longitude\":151.15018},{\"latitude\":-33.89248,\"longitude\":151.14991},{\"latitude\":-33.89247,\"longitude\":151.1499},{\"latitude\":-33.89239,\"longitude\":151.14985},{\"latitude\":-33.89209,\"longitude\":151.14963},{\"latitude\":-33.89182,\"longitude\":151.14945},{\"latitude\":-33.89118,\"longitude\":151.1491},{\"latitude\":-33.89095,\"longitude\":151.14899},{\"latitude\":-33.8909,\"longitude\":151.14898},{\"latitude\":-33.89065,\"longitude\":151.14894},{\"latitude\":-33.89059,\"longitude\":151.14894},{\"latitude\":-33.89052,\"longitude\":151.14894},{\"latitude\":-33.89035,\"longitude\":151.14897},{\"latitude\":-33.89001,\"longitude\":151.14902},{\"latitude\":-33.88995,\"longitude\":151.14904},{\"latitude\":-33.89009,\"longitude\":151.14842},{\"latitude\":-33.89013,\"longitude\":151.1481},{\"latitude\":-33.89014,\"longitude\":151.14787},{\"latitude\":-33.89013,\"longitude\":151.1476},{\"latitude\":-33.8901,\"longitude\":151.14714},{\"latitude\":-33.89006,\"longitude\":151.14682},{\"latitude\":-33.89002,\"longitude\":151.14651},{\"latitude\":-33.88986,\"longitude\":151.14534},{\"latitude\":-33.88984,\"longitude\":151.14523},{\"latitude\":-33.8898,\"longitude\":151.14498},{\"latitude\":-33.88978,\"longitude\":151.14491},{\"latitude\":-33.88974,\"longitude\":151.14476},{\"latitude\":-33.88969,\"longitude\":151.14464},{\"latitude\":-33.88957,\"longitude\":151.14438},{\"latitude\":-33.88949,\"longitude\":151.14426},{\"latitude\":-33.88943,\"longitude\":151.14418},{\"latitude\":-33.88863,\"longitude\":151.14309},{\"latitude\":-33.88838,\"longitude\":151.14275},{\"latitude\":-33.88801,\"longitude\":151.14227},{\"latitude\":-33.88759,\"longitude\":151.14172},{\"latitude\":-33.88732,\"longitude\":151.14136},{\"latitude\":-33.8871,\"longitude\":151.14107},{\"latitude\":-33.88699,\"longitude\":151.14091},{\"latitude\":-33.88673,\"longitude\":151.14039},{\"latitude\":-33.88665,\"longitude\":151.14021},{\"latitude\":-33.8865,\"longitude\":151.13991},{\"latitude\":-33.88628,\"longitude\":151.13938},{\"latitude\":-33.88626,\"longitude\":151.13932},{\"latitude\":-33.88612,\"longitude\":151.13887},{\"latitude\":-33.88609,\"longitude\":151.13877},{\"latitude\":-33.886,\"longitude\":151.13846},{\"latitude\":-33.8859,\"longitude\":151.13818},{\"latitude\":-33.88546,\"longitude\":151.13717},{\"latitude\":-33.88541,\"longitude\":151.13705},{\"latitude\":-33.88527,\"longitude\":151.13674},{\"latitude\":-33.88519,\"longitude\":151.13656},{\"latitude\":-33.88516,\"longitude\":151.1365},{\"latitude\":-33.88509,\"longitude\":151.13633},{\"latitude\":-33.88476,\"longitude\":151.13561},{\"latitude\":-33.88455,\"longitude\":151.13515},{\"latitude\":-33.88446,\"longitude\":151.13496},{\"latitude\":-33.88433,\"longitude\":151.13471},{\"latitude\":-33.88427,\"longitude\":151.13467},{\"latitude\":-33.88426,\"longitude\":151.13465},{\"latitude\":-33.88419,\"longitude\":151.13457},{\"latitude\":-33.88403,\"longitude\":151.13434},{\"latitude\":-33.88382,\"longitude\":151.13408},{\"latitude\":-33.88363,\"longitude\":151.13388},{\"latitude\":-33.88339,\"longitude\":151.13363},{\"latitude\":-33.88289,\"longitude\":151.13321},{\"latitude\":-33.88222,\"longitude\":151.13278},{\"latitude\":-33.88195,\"longitude\":151.13258},{\"latitude\":-33.88184,\"longitude\":151.13249},{\"latitude\":-33.88181,\"longitude\":151.13247},{\"latitude\":-33.88087,\"longitude\":151.13174},{\"latitude\":-33.88069,\"longitude\":151.13156},{\"latitude\":-33.87961,\"longitude\":151.13051},{\"latitude\":-33.87894,\"longitude\":151.12985},{\"latitude\":-33.8789,\"longitude\":151.12984},{\"latitude\":-33.87856,\"longitude\":151.12946},{\"latitude\":-33.87839,\"longitude\":151.12928},{\"latitude\":-33.87827,\"longitude\":151.12916},{\"latitude\":-33.87824,\"longitude\":151.12913},{\"latitude\":-33.87779,\"longitude\":151.12875},{\"latitude\":-33.87749,\"longitude\":151.1285},{\"latitude\":-33.87745,\"longitude\":151.12847},{\"latitude\":-33.87739,\"longitude\":151.12841},{\"latitude\":-33.87705,\"longitude\":151.12796},{\"latitude\":-33.87702,\"longitude\":151.12793},{\"latitude\":-33.87695,\"longitude\":151.12782},{\"latitude\":-33.87644,\"longitude\":151.12709},{\"latitude\":-33.87635,\"longitude\":151.12697},{\"latitude\":-33.87613,\"longitude\":151.12665},{\"latitude\":-33.87594,\"longitude\":151.12639},{\"latitude\":-33.87584,\"longitude\":151.12624},{\"latitude\":-33.87557,\"longitude\":151.12569},{\"latitude\":-33.87551,\"longitude\":151.12556},{\"latitude\":-33.87548,\"longitude\":151.12551},{\"latitude\":-33.87544,\"longitude\":151.12543},{\"latitude\":-33.87508,\"longitude\":151.12457},{\"latitude\":-33.87498,\"longitude\":151.12434},{\"latitude\":-33.8749,\"longitude\":151.12415},{\"latitude\":-33.87466,\"longitude\":151.12352},{\"latitude\":-33.87447,\"longitude\":151.12291}]}]}]}";
		JsonObject testResponse = JsonParser.parseString(json).getAsJsonObject();
		// Gets the routes array from the JSON response
		JsonArray routes = testResponse.getAsJsonArray("routes");
		// Gets the legs array within the routes array
		JsonArray legs = routes.get(0).getAsJsonObject().getAsJsonArray("legs");
		// Gets Summary object from the legs array
		JsonElement summary = ((JsonObject) legs.get(0)).get("summary");
		String points = ((JsonObject) legs.get(0)).get("points").toString();
		
		System.out.println("routes array from JSON");
		System.out.println(routes.toString());
		System.out.println("legs array from JSON");
		System.out.println(legs.toString());
		System.out.println("summary obj from legs");
		System.out.println(summary.toString());
		System.out.println("Lat/Long Points");
		System.out.println(points);
		

		s.runSimulation();

	}// end main

}// end class