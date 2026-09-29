import express from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/userController.js';

const router = express.Router();

// GET all users
router.route('/').get(getUsers);

// PUT (update) and DELETE user by ID
router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

export default router;