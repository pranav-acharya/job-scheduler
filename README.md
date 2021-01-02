# job-scheduler

Goals: Typically in a job scheduler, we have a job scheduled at a particular time. Ex. sending an email, msg, or performing a task.

Components: 
1. Job processors - Processors to process jobs based on the job type
2. Queue - stores the jobs
3. Job producer API - A way to add jobs, update jobs

Things to think about:
1. A database provides triggers but you cannot trigger a node process. You can only trigger another database activity based on the trigger. There are ways to detect trace events on a database that might help.
2. To communicate back to the consumer you need a two way channel. A database is typically a one way channel, so the consumer might have to poll the database which is not a good idea. Hence we need a socket based connection which is provided by other non RDBMS systems like redis. https://stackoverflow.com/questions/41103305/nodejs-redis-listener where you can perform publish subscribe effectively
3. Another approach would be since we generally have 2 processes - one consumer one producer, both updating the same shared storage (db/whatever) but updating each other via Inter process communication to notify each other of events. Here the 2 way communication is pulled up from the storage level to the process level to enable Pub-Sub


Express Based Job scheduler:
Here the producer API and the job processors will be running in the same node process which hosts the express server using timeouts
The queue will be stored in sqlite 3.
A Job table will have the schema (id, type, status, timestamp, completionTime, updatedAt, logs, data)
type - type of job based on the processors
status - pending | failed | completed
timestamp - time at which the job is to be executed
completionTime - time took for completion. 
updatedAt - if the job data were updated at any time
data - job data or the data required to execute the job. Ex. receiver and sender address, subject, content for an email job

Implementation Approach 1:


1. When the server starts, select the job with the least timestamp and create a timeout based on (timstamp - currentTime)
2. When the job is executed, update the job with status and completionTime, update the timeout based on the next least timestamp job
3. When a job is updated, say the timestamp was updated, update the table and recalculate the job with least timestamp
4. When a job is deleted, update the status to deleted or delete the job and refect the job with least timestamp

Time Complexity: O(n)
Space complexity: O(1) Here only one job stays in memory, rest is on disk

Implementation Approach 2:
1. When the server starts, load all jobs and build a min heap timestamp. Set a timeout based on timestamp - currentTime
2. When the job is executed, update the job with status and completionTime and remove the job from the heap, get the next least timestamp job from heap
3. When a job is updated, say the timestamp was updated, update the table and recalculate the job with least timestamp by updating the heap
4. When a job is deleted, update the status to deleted or delete the job and refect the job with least timestamp by updating the heap

TimeComplexity: O(log N) heap operations
SpaceComplexity O(N) since most of the jobs or job pointers will be in memory
