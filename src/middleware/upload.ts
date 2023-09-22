import * as multer from 'multer';

const util = require('util');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // get name from form data
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = file.originalname.replace(`.${fileExtension}`, '');
    //replace all special character with _
    const newFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_');
    //add timestamp to file name
    const finalFileName = `${new Date().getTime()}_${newFileName}.${fileExtension}`;
    cb(null, finalFileName);
  }
})

const upload = multer({storage: storage}).single('file');
const uploadFileMiddleware = util.promisify(upload);
export default uploadFileMiddleware;
