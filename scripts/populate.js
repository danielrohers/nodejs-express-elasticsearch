const request = require('request');
const log = require('winston');
const async = require('async');
const client = require('../app/services/elasticsearch');

const index = 'library-index';

const existExist = (cb) => {
  client.indices.exists({ index }, (err, response) => cb(err, response));
};

const deleteIndex = (exist, cb) => {
  if (!exist) return cb(null);
  log.info(`Deleting ${index} index`);
  client.indices.delete({ index }, err => cb(err));
};

const getLibraries = (cb) => {
  log.info('Requesting libraries');
  request
    .get({
      uri: 'https://api.cdnjs.com/libraries',
      json: true,
    }, (err, response, body) => {
      if (err) return cb(err);
      if (response.statusCode !== 200) return cb(`STATUS: ${response.statusCode} => ${body}`);
      cb(null, body.results);
    });
};

const create = (libraries, cb) => {
  log.info(`Creating ${index} index`);
  async.eachSeries(libraries, (library, cb) => {
    client.create({
      index,
      type: 'library',
      id: Date.now(),
      body: library,
    }, cb);
  }, cb);
};

async.waterfall([
  async.apply(existExist),
  async.apply(deleteIndex),
  async.apply(getLibraries),
  async.apply(create),
], (err) => {
  if (err) return log.error(err);
  log.info('Populate ready');
});
