/* eslint-disable consistent-return */
/* eslint-disable implicit-arrow-linebreak */
import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const postNew = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  dbClient.db
    .collection('users')
    .findOne({ email })
    .then((u) => {
      if (u) return res.status(400).json({ error: 'Already exist' });
      dbClient.db
        .collection('users')
        // eslint-disable-next-line arrow-body-style
        .insertOne({ email, password: sha1(password) }, (err, docResult) => {
          return res.status(201).json({ id: docResult.insertedId, email });
        });
    });
};

const getMe = async (req, res) => {
  const token = req.header('X-Token');
  if (token) {
    const uid = await redisClient.get(`auth_${token}`);
    if (uid) {
      return dbClient.db
        .collection('users')
        .findOne(ObjectId(uid))
        .then((user) => {
          if (user) {
            return res.status(200).json({ id: user._id, email: user.email });
          }
          return res.status(401).json({ error: 'Unauthorized' });
        });
    }
  }
  return res.status(401).json({ error: 'Unauthorized' });
};

export default { postNew, getMe };
