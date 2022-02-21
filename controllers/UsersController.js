/* eslint-disable consistent-return */
/* eslint-disable implicit-arrow-linebreak */
import sha1 from 'sha1';
import dbClient from '../utils/db';

const postNew = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).send('Missing email');
  }
  if (!password) {
    return res.status(400).send('Missing password');
  }

  dbClient.db
    .collection('users')
    .findOne({ email })
    .then((u) => {
      if (u) return res.status(400).send('Already exists');
      dbClient.db
        .collection('users')
        // eslint-disable-next-line arrow-body-style
        .insertOne({ email, password: sha1(password) }, (err, docResult) => {
          return res.json({ id: docResult.insertedId, email });
        });
    });
};

export default { postNew };
