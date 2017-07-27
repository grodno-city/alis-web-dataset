import { spawn } from 'child_process';
import path from 'path';
import through from 'through2';
import split from 'split';
import { MongoClient } from 'mongodb';

const pathToScript = path.join(__dirname, '../lib/alis-web-index/bin');
const pathToSnapshot = path.join(__dirname, '../snapshots/snapshot.txt');

const { DB_USER, DB_PASS } = process.env;

const url = `mongodb://${DB_USER}:${DB_PASS}@ds123933.mlab.com:23933/library-data-set`;

const filterDocuments = (object, _, next) => {
  if (object.record) return next(null, object.record);
  return next();
};

const createWriter = collection => (object, _, next) =>
  collection.insertOne(object, (err, __) => {
    if (err) {
      console.error(err);
      return process.exit(1);
    }

    return next();
  })
;

MongoClient.connect(url, (err, db) => {
  if (err) process.exit(1);

  console.log('connected to database');

  const rawDataSet = db.collection('raw-data-set');

  const child = spawn('babel-node', [pathToScript, '-s', pathToSnapshot]);

  child.stdout
    .pipe(split(JSON.parse))
    .pipe(through.obj(filterDocuments))
    .on('error', console.error)
    .pipe(through.obj(createWriter(rawDataSet)));
});
