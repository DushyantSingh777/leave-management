const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required']
    },
    leaveType: {
      type: String,
      enum: ['Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Unpaid', 'Other'],
      required: [true, 'Leave type is required']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      minlength: [10, 'Reason must be at least 10 characters'],
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewNote: {
      type: String,
      trim: true,
      maxlength: [300, 'Review note cannot exceed 300 characters'],
      default: ''
    },
    totalDays: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

// Calculate total days before saving
leaveSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

// Validate end date is after start date
leaveSchema.path('endDate').validate(function (value) {
  return value >= this.startDate;
}, 'End date must be on or after start date');

module.exports = mongoose.model('Leave', leaveSchema);
