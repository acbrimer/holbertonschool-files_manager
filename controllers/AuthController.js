/* eslint-disable consistent-return */
import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const getConnect = async (req, res) => {
  if (!req.header('Authorization')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const b64auth = req.header('Authorization').split(' ')[1] || '';
  try {
    const [email, password] = Buffer.from(b64auth, 'base64')
      .toString()
      .split(':');
    dbClient.db
      .collection('users')
      .findOne({ email, password: sha1(password) })
      // eslint-disable-next-line consistent-return
      .then((user) => {
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        const token = uuidv4();
        redisClient.set(`auth_${token}`, user._id.toString(), 60 * 60 * 24);
        return res.status(200).json({ token });
      });
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const getDisconnect = async (req, res) => {
  const token = req.header('X-Token');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const u = await redisClient.get(`auth_${token}`);
  if (!u) return res.status(401).json({ error: 'Unauthorized' });
  redisClient.del(`auth_${token}`);
  return res.status(204).json({});
};

export default { getConnect, getDisconnect };
