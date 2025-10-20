const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const submissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },

    // source and language
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['javascript', 'python', 'cpp', 'java', 'c'] // expand lang support
    },

    // judge result
    status: {
        type: String,
        enum: [
            'pending',
            'running',
            'accepted',
            'wrong_answer',
            'time_limit_exceeded',
            'memory_limit_exceeded',
            'runtime_error',
            'compilation_error',
            'error',
            'failed'
        ],
        default: 'pending'
    },


    // metrics
    runtime: {
        type: Number,
        default: 0
    },
    memory: {
        type: Number,
        default: 0
    },

    errorMessage: {
        type: String,
        default: ''
    },

    // test breakdown
    testCasesPassed: {
        type: Number,
        default: 0
    },
    testCasesTotal: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// indexes for common queries
submissionSchema.index({ userId: 1, problemId: 1 });
// SubmissionSchema.index({ problem: 1, status: 1 });

const Submission = mongoose.model('submission', submissionSchema)

module.exports = Submission; 