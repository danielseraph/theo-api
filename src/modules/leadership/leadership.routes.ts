import { Router } from 'express';
import { LeadershipController } from './leadership.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import {
  createLeadershipMemberSchema,
  updateLeadershipMemberSchema,
  reorderLeadershipSchema,
} from './leadership.validator';

const publicLeadershipRouter = Router();
const adminLeadershipRouter = Router();
const controller = new LeadershipController();

// Public Routes
// GET /api/v1/leadership
publicLeadershipRouter.get('/', controller.getMembers);

// Admin Routes
// Apply authentication and authorization for all admin routes
adminLeadershipRouter.use(authenticate, authorize('ADMIN'));

// POST /api/v1/admin/leadership
adminLeadershipRouter.post(
  '/',
  validate(createLeadershipMemberSchema),
  controller.createMember
);

// PATCH /api/v1/admin/leadership/reorder
adminLeadershipRouter.patch(
  '/reorder',
  validate(reorderLeadershipSchema),
  controller.reorderMembers
);

// PUT /api/v1/admin/leadership/:id
adminLeadershipRouter.put(
  '/:id',
  validate(updateLeadershipMemberSchema),
  controller.updateMember
);

// DELETE /api/v1/admin/leadership/:id
adminLeadershipRouter.delete(
  '/:id',
  controller.deleteMember
);

export { publicLeadershipRouter, adminLeadershipRouter };
