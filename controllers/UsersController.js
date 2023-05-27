import { Request, Response } from 'express';
import dbClient from '../utils/db';
import sha1 from 'sha1';
/**
 * @param {Request} req
 * @param {Response} res
 */
async function postNew(req, res) {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).send({ error: 'Missing email' });
  }

  if (!password) {
    return res.status(400).send({ error: 'Missing password' });
  }

  const emailExists = await dbClient.collection('users').findOne({ email });

  if (emailExists) {
    return res.status(400).send({ error: 'Already exist' });
  }

  const hashedPassword = sha1(password);
  const { insertedId } = await dbClient
    .collection('users')
    .insertOne({ email, password: hashedPassword });
  const user = await dbClient.collection('users').findOne({ _id: insertedId });

  res.status(201).send({ id: user._id, email: user.email });
}

const UsersController = {
  postNew
};

export default UsersController;
