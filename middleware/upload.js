const util = require("util");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const dbConfig = require("../config/db_config");
const mongoose = require('mongoose');
var Grid = require('gridfs-stream');

const mongoURI = 'mongodb+srv://prabhat10:prabhat2373@cluster0.2owkf.mongodb.net/Ecommerce?retryWrites=true&w=majority';

const promise = mongoose.connect(mongoURI, {
    useNewUrlParser: true, useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});

const conn = mongoose.connection;
let gfs;

conn.once('open', () => {
    gfs = Grid(conn, mongoose.mongo);
    gfs.collection('uploads');
});

var storage = new GridFsStorage({
    db: promise,
    file: (req, file) => {
        const match = ["image/png", "image/jpeg", "svg/webp"];

        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}-Images-${file.originalname}`;
            return filename;
        }

        return {
            bucketName: dbConfig.imgBucket,
            filename: `${Date.now()}-Images-${file.originalname}`
        };
    }
});

var uploadFiles = multer({ storage: storage }).array("file", 10);
var uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;