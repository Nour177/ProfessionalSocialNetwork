import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee', 
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Interviewing', 'Rejected', 'Accepted'],
        default: 'Applied'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent a user from applying to the same job twice
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;