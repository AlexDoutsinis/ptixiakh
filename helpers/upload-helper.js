const path = require('path');

module.exports = {

  uploadDir: path.join(__dirname, '../public/blog-posts-images/'),

  isEmpty: function (obj) {

    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  },

  // fuzzy search
  escapeRegex: function (text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
  }

}