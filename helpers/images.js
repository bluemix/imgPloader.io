var models = require('../models');

module.exports = {
  popular: function(callback) {
    models.Image.find({}, {}, {
        limit: 5,
        sort: {
          likes: -1
        }
      },
      function(err, images) {
        if (err) throw err;

        console.log('popular images: ' + images.length)
        console.log('popular[0]: ' + JSON.stringify(images[0]))
        callback(null, images);
      });
  }
};
