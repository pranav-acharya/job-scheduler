const DB_NAME = 'jobs.db';
const JOB_TABLE = 'job';

const createTableIfNotExists = (db) => {
    const query = `CREATE TABLE IF NOT EXISTS ${JOB_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT, 
      timestamp DATE,
      type VARCHAR(50),
      status VARCHAR(50),
      logs TEXT, 
      completed BOOL DEFAULT 0
    );`;
    db.run(query);
}

const computeNextJob = (db, cb) => {
    let nextJob = null;
    db.all(`SELECT id, MIN(timestamp) as timestamp FROM ${JOB_TABLE} WHERE completed=0`, function (err, rows) {
        console.log(rows);
        nextJob = rows[0];
        cb(nextJob);
    });
}

const updateJob = (db, jobId, jobData, cb) => {
    const { data, type, timestamp } = jobData;
    var stmt = db.prepare(`UPDATE ${JOB_TABLE} SET data='${data}', type='${type}', timestamp='${timestamp}' WHERE id=${jobId}`);
    stmt.run(data, type, timestamp, (err, result) => {
        if (err) {
            return console.log(err.message);
        }
        console.log(`A row has been inserted with rowid ${Object.keys(this)}`);
        cb(this.lastID);
    }); 
    stmt.finalize();
};

const addJob = (db, jobData, cb) => {
    const { data, type, timestamp } = jobData;
    var stmt = db.prepare(`INSERT INTO ${JOB_TABLE}(data, type, timestamp) VALUES (?,?,?)`);
    
    const result = stmt.run(data, type, timestamp, function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${Object.keys(this)}`);
        cb(this.lastID);
    });
    stmt.finalize();
};

const scheduleJob = (job) => {
    if (!job) return;
    var currentTime = new Date().getTime();
    var delay = currentTime - job.timestamp;
    var timeout = setTimeout(() => executeJob(job), delay);
    return timeout;
};

const getJobList = (db, cb) => {
    const result = [];
    db.all(`SELECT * FROM ${JOB_TABLE}`, (err, rows) => { 
        cb(rows);
    });
}

const executeJob = (job) => {
    console.log("Executed: " + job.id + " at " + new Date());
};

module.exports = {
    DB_NAME,
    JOB_TABLE,
    createTableIfNotExists,
    getJobList,
    computeNextJob,
    scheduleJob,
    executeJob,
    addJob,
    updateJob
};