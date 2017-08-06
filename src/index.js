import { spawn } from 'child_process';
import path from 'path';
import through from 'through2';
import split from 'split';
import { MongoClient } from 'mongodb';

const pathToScript = path.join(__dirname, '../lib/alis-web-index/bin');
const pathToSnapshot = path.join(__dirname, '../snapshots/snapshot.txt');

const { DB_USER, DB_PASS, DB_URL } = process.env;

let url = `mongodb://${DB_USER}:${DB_PASS}@${DB_URL}/library-data-set`;

if (!DB_USER && !DB_PASS && DB_URL) {
  url = `mongodb://${DB_URL}/library-data-set`;
}

if (!DB_USER || !DB_PASS || !DB_URL) {
  url = 'mongodb://mongodb:27017/library-data-set';
}

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
    .pipe(through((chunk, _, next) => {
      console.log(chunk.toString());
      next(null, chunk);
    }))
    .pipe(split(JSON.parse))
    .pipe(through.obj(filterDocuments))
    .pipe(through.obj(createWriter(rawDataSet)));

  child.stderr
    .on('data', data => console.error(data.toString()));
});
