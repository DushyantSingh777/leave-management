const { validationResult } = require('express-validator');
const Leave = require('../models/Leave');

// POST /api/leaves - Employee applies for leave
const applyLeave = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past.' });
    }
    if (end < start) {
      return res.status(400).json({ message: 'End date must be on or after start date.' });
    }

    // Check for overlapping leave requests
    const overlap = await Leave.findOne({
      employee: req.user._id,
      status: { $ne: 'Rejected' },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });
    if (overlap) {
      return res.status(409).json({ message: 'You already have a leave request overlapping these dates.' });
    }

    const leave = new Leave({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason
    });

    await leave.save();
    await leave.populate('employee', 'name email department');

    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ message: 'Failed to submit leave application.' });
  }
};

// GET /api/leaves/my - Employee views their own leaves
const getMyLeaves = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { employee: req.user._id };
    if (status) query.status = status;

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      leaves,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ message: 'Failed to fetch leave requests.' });
  }
};

// GET /api/leaves/all - Employer views all leave requests
const getAllLeaves = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('employee', 'name email department')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      leaves,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ message: 'Failed to fetch leave requests.' });
  }
};

// PATCH /api/leaves/:id/review - Employer approves or rejects
const reviewLeave = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    const { id } = req.params;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either Approved or Rejected.' });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    if (leave.status !== 'Pending') {
      return res.status(409).json({ message: `This leave has already been ${leave.status.toLowerCase()}.` });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewNote = reviewNote || '';
    await leave.save();

    await leave.populate('employee', 'name email department');
    await leave.populate('reviewedBy', 'name email');

    res.json({
      message: `Leave request ${status.toLowerCase()} successfully`,
      leave
    });
  } catch (error) {
    console.error('Review leave error:', error);
    res.status(500).json({ message: 'Failed to review leave request.' });
  }
};

// DELETE /api/leaves/:id - Employee cancels a pending leave
const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findOne({ _id: req.params.id, employee: req.user._id });
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found.' });
    }
    if (leave.status !== 'Pending') {
      return res.status(409).json({ message: 'Only pending leave requests can be cancelled.' });
    }

    await leave.deleteOne();
    res.json({ message: 'Leave request cancelled successfully.' });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ message: 'Failed to cancel leave request.' });
  }
};

// GET /api/leaves/stats - Summary stats (employer)
const getStats = async (req, res) => {
  try {
    const stats = await Leave.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const result = { Total: 0, Pending: 0, Approved: 0, Rejected: 0 };
    stats.forEach(s => {
      result[s._id] = s.count;
      result.Total += s.count;
    });

    res.json(result);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics.' });
  }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, reviewLeave, cancelLeave, getStats };
