const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  host: process.env.ELASTIC_SEARCH || 'localhost:9200',
  log: 'info',
});

module.exports = client;
