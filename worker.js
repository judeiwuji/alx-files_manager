import fs from 'fs';
import Queue from 'bull';
import { ObjectId } from 'mongodb';
import imageThumbnail from 'image-thumbnail';
import dbClient from './utils/db';

const fileQueue = new Queue('file transcoding');
fileQueue.process('image-thumbnail', async (job, done) => {
  if (!job.data.fileId) {
    done(new Error('Missing fileId'));
    return;
  }

  if (!job.data.userId) {
    done(new Error('Missing userId'));
    return;
  }

  const file = await dbClient.collection('files').findOne({
    _id: ObjectId(job.data.fileId),
    userId: ObjectId(job.data.userId),
  });

  if (!file) {
    done(new Error('File not found'));
    return;
  }

  try {
    const data = await fs.promises.readFile(file.localPath);
    const sizes = [500, 250, 100];
    for (const size of sizes) {
      imageThumbnail(data, { width: size })
        .then((thumbnail) => {
          fs.promises
            .writeFile(`${file.localPath}_${size}`, thumbnail, {
              encoding: 'base64',
            })
            .then(() => {
              done();
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => {
          done(error);
        });
    }
  } catch (error) {
    done(error);
  }
});
