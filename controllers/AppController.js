import { request, response } from 'express';
import { v4 as uuidV4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

function getStatus(req, res) {
  res.send({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
}

async function getStats(req, res) {
  res.send({
    users: await dbClient.nbUsers(),
    files: await dbClient.nbFiles(),
  });
}

async function getConnect(req = request, res = response) {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }
  const base64 = authorization.split(' ')[1];
  const credentials = Buffer.from(base64, 'base64').toString();
  const [email, password] = credentials.split(':');
  const user = await dbClient.collection('users').findOne({ email });

  if (!user || user.password !== sha1(password)) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }
  const token = uuidV4();
  const key = `auth_${token}`;
  await redisClient.set(key, user._id, 60 * 60 * 24);
  res.send({ token });
}

async function getDisconnect(req = request, res = response) {
  const token = req.headers['x-token'];

  const key = `auth_${token}`;
  const user = await redisClient.get(key);
  if (!user) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }
  await redisClient.del(key);
  res.status(204).send();
}

const AppController = {
  getStatus,
  getStats,
  getConnect,
  getDisconnect,
};

export default AppController;
