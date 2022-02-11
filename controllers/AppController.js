/* eslint-disable implicit-arrow-linebreak */
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const getStatus = (req, res) =>
  res.json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });

const getStats = async (req, res) => {
  const users = await dbClient.nbUsers();
  const files = await dbClient.nbFiles();
  return res.json({ users, files });
};

export default { getStatus, getStats };
