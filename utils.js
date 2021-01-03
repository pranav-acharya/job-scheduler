const DB_NAME = 'jobs.db';
const JOB_TABLE = 'job';

const createTableIfNotExists = (db) => {
    const query = `CREATE TABLE IF NOT EXISTS ${JOB_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT, timestamp DATE,
      type VARCHAR(50),
      status VARCHAR(50),
      logs TEXT, 
      completed BOOL
    );`;
    db.run(query);
}

const computeNextJob = (db) => {
    let nextJob = null;
    // TODO: convert timestamp to IN and test MIN
    db.each(`SELECT id, MIN(timestamp) FROM ${JOB_TABLE} WHERE completed = FALSE`, function (err, row) {
        console.log(row);
        nextJob = row;
    });
    return nextJob;
}

const updateJob = (db, jobData) => {
    // TODO: implement update
    // const query = `CREATE TABLE IF NOT EXISTS ${JOB_TABLE} (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     data TEXT, 
    //     timestamp DATE,
    //     type VARCHAR(50),
    //     status VARCHAR(50) DEFAULT 'PENDING',
    //     logs TEXT, 
    //     completed BOOL DEFAULT FALSE
    //   );`;
    // var stmt = db.prepare(`UPDATE ${JOB_TABLE}(data, type, timestamp) VALUES (?,?,?)`);
    // const { data, type, timestamp } = jobData;
    // stmt.run(data, type, timestamp); 
    // stmt.finalize();
    // db.run(query);
};

const addJob = (db, jobData, cb) => {
    const { data, type, timestamp } = jobData;
    var stmt = db.prepare(`INSERT INTO ${JOB_TABLE}(data, type, timestamp) VALUES (?,?,?)`);
    
    const result = stmt.run(data, type, timestamp, function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
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

const getJobList = (db) => {
    const result = [];
    db.serialize(function () {
        db.each(`SELECT * FROM ${JOB_TABLE}`, (err, row) => result.push(row))
    });
    return result;
}

const executeJob = (job) => {
    console.log("Executed: " + job.id + " at " + new Date());
};

const getNextJob = () => nextJob;

module.exports = {
    DB_NAME,
    JOB_TABLE,
    createTableIfNotExists,
    getJobList,
    getNextJob,
    computeNextJob,
    scheduleJob,
    executeJob,
    addJob,
    updateJob
};