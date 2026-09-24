import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import { publicRouter as registrationPublicRouter, adminRouter as registrationAdminRouter } from '../modules/registrations/registrations.routes';
import { postPublicRouter, postAdminRouter } from '../modules/posts/posts.routes';
import mediaAdminRouter from '../modules/media/media.routes';
import { contactPublicRouter, contactAdminRouter } from '../modules/contact/contact.routes';
import dashboardRouter from '../modules/dashboard/dashboard.routes';
import { publicGalleryRouter, adminGalleryRouter } from '../modules/gallery/gallery.routes';
import { publicEventsRouter, adminEventsRouter } from '../modules/events/events.routes';
import { publicLeadershipRouter, adminLeadershipRouter } from '../modules/leadership/leadership.routes';

const router = Router();

// Auth
router.use('/auth', authRoutes);

// Public routes
router.use('/registrations', registrationPublicRouter);
router.use('/posts', postPublicRouter);
router.use('/contact', contactPublicRouter);
router.use('/gallery', publicGalleryRouter);
router.use('/events', publicEventsRouter);
router.use('/leadership', publicLeadershipRouter);

// Admin routes
router.use('/admin/dashboard', dashboardRouter);
router.use('/admin/registrations', registrationAdminRouter);
router.use('/admin/posts', postAdminRouter);
router.use('/admin/media', mediaAdminRouter);
router.use('/admin/contact-messages', contactAdminRouter);
router.use('/admin/gallery', adminGalleryRouter);
router.use('/admin/events', adminEventsRouter);
router.use('/admin/leadership', adminLeadershipRouter);

export default router;
