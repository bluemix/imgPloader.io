var fs = require('fs'),
  path = require('path'),
  sidebar = require('../helpers/sidebar'),
  Models = require('../models');
var md5 = require('MD5');

module.exports = {
  index: function(req, res) {
    var viewModel = {
      image: {},
      comments: []
    };


    Models.Image.findOne({
      filename: {
        $regex: req.params.image_id
      }
    }, function(err, image) {
      if (err) {
        throw err;
      }
      if (image) {
        image.views = image.views + 1
        viewModel.image = image;
        image.save()


        Models.Comment.find({
          image_id: image._id
        }, {}, {
          sort: {
            'timestamp': 1
          }
        }, function(err, comments) {
          viewModel.comments = comments

          console.log('viewModel: ' + JSON.stringify(viewModel))
          sidebar(viewModel, function(viewModel) {
            res.render('image', viewModel);
          });


        });
      } else { // image not found!
        res.redirect('/');
      }
    });


  },
  create: function(req, res) {
    console.log("in create...")

    var saveImage = function() {
      console.log("req.files[0]: " + JSON.stringify(req.files[0]))

      var fileExtension = path.extname(req.files[0].originalname).toLowerCase();
      var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
        imgUrl = req.files[0].originalname.replace(fileExtension, "") +
        '_';

      for (var i = 0; i < 10; i += 1) {
        imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
      }


      Models.Image.find({
        filename: imgUrl
      }, function(err, images) {
        if (images.length > 0) {
          saveImage();
        } else {

          if (req.files.length > 0) {

            var tempPath = req.files[0].path,
              ext = path.extname(req.files[0].originalname).toLowerCase(),
              targetPath = path.resolve('./public/upload/' + imgUrl +
                ext);

            // if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' ||
            //   ext ===
            //   '.gif') {
            fs.rename(tempPath, targetPath, function(err) {
              if (err) throw err;


              var newImg = new Models.Image({
                title: req.body.title,
                filename: imgUrl + ext,
                description: req.body.description
              });

              newImg.save(function(err, image) {
                res.redirect('/images/' + imgUrl);

              })


            });
            // }
            // else {
            //   fs.unlink(tempPath, function() {
            //     if (err) throw err;
            //
            //     res.json(500, {
            //       error: 'Only image files are allowed.'
            //     });
            //   });
            // }
          } else {
            res.redirect('/');
          }
        }
      });


    };
    saveImage();
  },
  like: function(req, res) {
    Models.Image.findOne({
      filename: {
        $regex: req.params.image_id
      }
    }, function(err, image) {
      if (err) {
        res.json(err);
        return;
      } else if (image) {
        image.likes = image.likes + 1
        image.save(function(err) {
          if (err) {
            res.json(err)
            return;
          } else {
            res.json({
              likes: image.likes
            })
          }
        });
      }
    });
  },
  comment: function(req, res) {
    Models.Image.findOne({
      filename: {
        $regex: req.params.image_id
      }
    }, function(err, image) {
      if (!err && image) {
        console.log("req.body: " + JSON.stringify(req.body))
        var newComment = new Models.Comment(req.body);
        newComment.gravatar = md5(newComment.email);
        newComment.image_id = image._id;
        newComment.save(function(err, comment) {
          if (err) {
            throw err;
          }

          res.redirect('/images/' + image.uniqueId + '#' + comment._id);
        })
      } else {
        res.redirect('/');
      }
    });
  },
  remove: function(req, res) {
    Models.Image.findOne({
      filename: {
        $regex: req.params.image_id
      }
    }, function(err, image) {
      if (err) {
        throw err;
      }

      fs.unlink(path.resolve('./public/upload/' + image.filename),
        function(err) {
          if (err) {
            throw err;
          }

          Models.Comment.remove({
            image_id: image._id
          }, function(err) {
            image.remove(function(err) {
              if (!err) {
                res.json(true);
              } else {
                res.json(false);
              }
            });
          });
        });
    });
  }
};
