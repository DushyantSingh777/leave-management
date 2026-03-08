const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave,
  getStats
} = require('../controllers/leaveController');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post(
  '/',
  authorize('employee'),
  [
    body('leaveType')
      .isIn(['Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Unpaid', 'Other'])
      .withMessage('Invalid leave type'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('reason')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters')
  ],
  applyLeave
);

router.get('/my', authorize('employee'), getMyLeaves);
router.delete('/:id', authorize('employee'), cancelLeave);

// Employer routes
router.get('/all', authorize('employer'), getAllLeaves);
router.get('/stats', authorize('employer'), getStats);
router.patch(
  '/:id/review',
  authorize('employer'),
  [
    body('status').isIn(['Approved', 'Rejected']).withMessage('Status must be Approved or Rejected'),
    body('reviewNote').optional().trim().isLength({ max: 300 }).withMessage('Review note max 300 characters')
  ],
  reviewLeave
);

module.exports = router;
