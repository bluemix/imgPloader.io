var sidebar = require('../helpers/sidebar'),
  ImageModel = require('../models').Image;



module.exports = {
  index: function(req, res) {


    var viewModel = {
      images: []
    };

    // console.log("headers: " + req.headers['user-agent'])
    // JSON.stringify(req.headers)


    ImageModel.find({}, {}, {
        sort: {
          timestamp: -1
        }
      },
      function(err, images) {
        if (err) {
          throw (err);
        }

        viewModel.images = images;

        sidebar(viewModel, function(viewModel) {
          res.render('index', viewModel);
        });
      });

  }
};
