import fs from 'fs';
import path from 'path';
import { request, response } from 'express';
import { ObjectId } from 'mongodb';
import { v4 as uuidV4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

async function postUpload(req = request, res = response) {
  const token = req.headers['x-token'];
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);

  if (!userId) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }
  // eslint-disable-next-line object-curly-newline
  const { name, type, parentId, isPublic, data } = req.body;

  if (!name) {
    res.status(400).send({ error: 'Missing name' });
    return;
  }

  if (!type) {
    res.status(400).send({ error: 'Missing type' });
    return;
  }

  if (!data && type !== 'folder') {
    res.status(400).send({ error: 'Missing data' });
    return;
  }

  if (parentId) {
    const parentFile = await dbClient
      .collection('files')
      .findOne({ _id: ObjectId(parentId) });
    if (!parentFile) {
      res.status(400).send({ error: 'Parent not found' });
      return;
    }

    if (parentFile.type !== 'folder') {
      res.status(400).send({ error: 'Parent is not a folder' });
      return;
    }
  }

  if (type === 'folder') {
    const { insertedId } = await dbClient.collection('files').insertOne({
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
    });
    const file = await dbClient
      .collection('files')
      .findOne({ _id: insertedId });
    res.status(201).send({
      id: file._id,
      userId: file.userId,
      name: file.bane,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
    return;
  }

  const targetPath = path.join(process.env.FOLDER_PATH || '/tmp/files_manager');
  const localPath = path.join(targetPath, uuidV4());
  try {
    await fs.promises.mkdir(targetPath, { recursive: true });
  } catch (error) {
    // do nothing
  }
  try {
    await fs.promises.writeFile(localPath, data, {
      encoding: 'utf8',
    });
  } catch (error) {
    res.status(400).send({ error: 'unable to create file' });
    return;
  }

  const result = await dbClient.collection('files').insertOne({
    userId,
    name,
    type,
    isPublic: isPublic || false,
    parentId: parentId || 0,
    localPath,
  });

  const file = await dbClient
    .collection('files')
    .findOne({ _id: result.insertedId });
  res.status(201).send({
    id: file._id,
    userId: file.userId,
    name: file.name,
    type: file.type,
    isPublic: file.isPublic,
    parentId: file.parentId,
  });
}

const FileController = {
  postUpload,
};

export default FileController;
