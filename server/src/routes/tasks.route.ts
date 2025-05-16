import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { TaskRepository } from '../repositories/task.repo';
import { TaskService } from '../services/tasks.service';
import { TaskController } from '../controllers/tasks.controller';

const router = Router();
const taskRepository = new TaskRepository();
const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService);

router.post('/', authenticateToken, taskController.createTask);
router.get('/', authenticateToken, taskController.getTasks);
router.get('/statistics', authenticateToken, taskController.getTaskStatistics);
router.put('/:id', authenticateToken, taskController.updateTask);
router.delete('/:id', authenticateToken, taskController.deleteTask);

export default router;