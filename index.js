var sqlite3 = require('sqlite3').verbose();
var file = "jobs.db";
var db = new sqlite3.Database(file);
const { 
  createTableIfNotExists, 
  getJobList, 
  getNextJob,
  computeNextJob,
  scheduleJob,
  updateJob,
  addJob,
} = require("./utils");
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
const port = 3000;
let nextJobTimeout = null;
let nextJob = null;

// preprocessing
db.serialize(function() {
  createTableIfNotExists(db);
  nextJob = computeNextJob(db);
  if (nextJob)
    nextJobTimeout = scheduleJob(nextJob);
}); 

app.get('/jobs', (req, res) => {
  res.json(getJobList(db));
})

app.get('/nextJob', (req, res) => {
   res.json(getNextJob());
});

app.post('/job', (req, res) => {
  const job = req.body;
  addJob(db, job, (id) => {
    if (!nextJob || job.timestamp < nextJob.timestamp) {
      console.log('job queue min updated');
      computeNextJob(db);
    }
    res.json({ id });
  });
});

app.put('/job/:id', (req, res) => {
  const jobData = req.body;
  const jobId = req.params.id;
  updateJob();
  if (jobData.timestamp) {
    clearTimeout(nextJobTimeout);
    nextJobTimeout = scheduleJob(computeNextJob(db));
  }
  res.end();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
