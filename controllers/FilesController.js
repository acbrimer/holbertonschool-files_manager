/* eslint-disable arrow-body-style */
/* eslint-disable consistent-return */
/* eslint-disable object-curly-newline */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable comma-dangle */
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import dbClient from '../utils/db';

import redisClient from '../utils/redis';

const postUpload = async (req, res) => {
  // check auth
  const token = req.header('X-Token');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const uid = await redisClient.get(`auth_${token}`);
  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // check data
  const { name, type, parentId, isPublic, data } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }
  if (!type) {
    return res.status(400).json({ error: 'Missing type' });
  }
  if (type !== 'folder' && !data) {
    return res.status(400).json({ error: 'Missing data' });
  }
  if (parentId && parentId !== 0) {
    try {
      ObjectId(parentId);
    } catch (err) {
      return res.status(400).json({ error: 'Parent not found' });
    }
    const parent = await dbClient.db
      .collection('files')
      .findOne(ObjectId(parentId));
    if (!parent) {
      return res.status(400).json({ error: 'Parent not found' });
    }
    if (parent.type && parent.type !== 'folder') {
      return res.status(400).json({ error: 'Parent is not a folder' });
    }
  }
  const p = process.env.FOLDER_PATH || '/tmp/files_manager';
  const fullPath = parentId && parentId !== 0 ? path.join(p, parentId) : p;
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
  const newId = uuidv4();
  const localPath = path.join(fullPath, newId);

  if (type === 'folder') {
    return dbClient.db
      .collection('files')
      .insertOne({
        userId: uid,
        name,
        type,
        isPublic,
        parentId: parentId || 0,
      })
      .then((r) =>
        res.status(201).json({
          id: r.insertedId,
          userId: uid,
          name,
          type,
          isPublic,
          parentId: parentId || 0,
        })
      );
  }

  const buffer = Buffer.from(data, 'base64').toString('utf-8');
  await fs.writeFile(
    localPath,
    buffer,
    // eslint-disable-next-line consistent-return
    (err) => {
      if (err) {
        return { error: err.message };
      }
    }
  );
  const newFileDoc = await dbClient.db.collection('files').insertOne({
    userId: uid,
    name,
    type,
    parentId: parentId !== 0 ? ObjectId(parentId) : parentId,
    isPublic,
    localPath,
  });
  return res.status(201).json({
    id: newFileDoc.insertedId,
    userId: uid,
    name,
    type,
    parentId: parentId || 0,
    isPublic,
    localPath,
  });
};

export default { postUpload };
