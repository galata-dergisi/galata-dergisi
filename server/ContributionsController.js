const path = require('path');
const multer = require('multer');
const fsPromises = require('fs').promises;
const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');

const MAX_FILE_SIZE = 1024 * 1024 * 100;

class ContributionsController {
  constructor(params) {
    this.databasePool = params.databasePool;

    this.init();
  }

  init() {
    this.router = new Router();

    this.initMulter();


    this.onPostContribution = this.onPostContribution.bind(this);
    this.initRoutes();
  }

  initMulter() {
    this.multerStorage = multer.diskStorage({
      destination: async function destinationFunction(req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');

        try {
          const stat = await fsPromises.stat(uploadDir);

          if (!stat.isDirectory()) {
            throw new Error('`uploads` must be a directory.');
          }

          cb(null, uploadDir);
        } catch (ex) {
          // If uploadDir doesn't exist then create it
          if (ex.code === 'ENOENT') {
            try {
              await fsPromises.mkdir(uploadDir);
              cb(null, uploadDir);
            } catch (err) {
              cb(err);
            }

            return;
          }

          cb(ex);
        }
      },
      filename: function fileNameFunction(req, file, cb) {
        setImmediate(() => {
          const fileExtension = path.extname(file.originalname);
          cb(null, `${uuidv4()}${fileExtension}`);
        });
      },
    });

    this.multer = multer({
      fileFilter: '',
      storage: this.multerStorage,
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
      },
    });
  }

  initRoutes() {
    this.router.post('/katkida-bulunun', this.multer.single('file'), this.onPostContribution);
  }

  getRouter() {
    return this.router;
  }

  async onPostContribution(req, res) {
    let conn;

    try {
      // TODO: Validate recaptcha here
      // TODO: Validate input & input lengths here

      conn = await this.databasePool.getConnection();

      await conn.query('INSERT INTO assets (name, email, title, type, video, message, filename) VALUES (?, ?, ?, ?, ?, ?, ?)', [
        req.body.name,
        req.body.email,
        req.body.title,
        req.body.assetType,
        req.body.videoLink || null,
        req.body.message,
        req.file.path,
      ]);

      res.json({ success: true });
    } catch (ex) {
      console.trace(ex);

      res.json({
        success: false,
        error: 'Sunucuda bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyiniz.',
      });
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }
}

module.exports = ContributionsController;
