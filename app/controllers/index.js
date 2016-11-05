const client = require('../services/elasticsearch');

const render = (res, data = {}) => {
  res.render('index', data);
};

const search = (q) => {
  return new Promise((resolve, reject) => {
    client.search({
      index: 'library-index',
      size: 30,
      q: `name:${q}`,
    }, (error, response) => {
      if (error) return reject(error);
      const hits = response.hits;
      resolve({
        libraries: hits.hits,
        total: hits.total,
      });
    });
  });
};

module.exports = {

  index: (req, res, next) => {
    const q = req.query.search;
    if (!q) return render(res);
    search(q)
      .then(data => render(res, data))
      .catch(next);
  },

};
