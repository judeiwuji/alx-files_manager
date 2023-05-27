import sha1 from 'sha1';
import { request, response } from 'express';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

async function postNew(req, res) {
  const { email, password } = req.body;

  if (!email) {
    res.status(400).send({ error: 'Missing email' });
    return;
  }

  if (!password) {
    res.status(400).send({ error: 'Missing password' });
    return;
  }

  const emailExists = await dbClient.collection('users').findOne({ email });

  if (emailExists) {
    res.status(400).send({ error: 'Already exist' });
    return;
  }

  const hashedPassword = sha1(password);
  const { insertedId } = await dbClient
    .collection('users')
    .insertOne({ email, password: hashedPassword });
  const user = await dbClient.collection('users').findOne({ _id: insertedId });

  res.status(201).send({ id: user._id, email: user.email });
}

async function getMe(req, res) {
  const token = req.headers['x-token'];
  const key = `auth_${token}`;
  const userID = await redisClient.get(key);
  console.log(userID);
  if (!userID) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }

  const user = await dbClient
    .collection('users')
    .findOne({ _id: ObjectId(userID) });
  if (!user) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }
  res.send({ id: user._id, email: user.email });
}

const UsersController = {
  postNew,
  getMe,
};

export default UsersController;
