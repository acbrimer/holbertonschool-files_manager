import express from 'express';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';

/**
 * GET /status => AppController.getStatus
 * GET /stats => AppController.getStats
 */

const router = express.Router();

// Home page route.
router.get('/status', AppController.getStatus);

// About page route.
router.get('/stats', AppController.getStats);

// Create user
router.post('/users', UsersController.postNew);

// User auth
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

export default router;
