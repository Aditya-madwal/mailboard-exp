import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        default: ''
    },

    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Review', 'Done'],
        default: 'To Do'
    },

    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },

    dueDate: {
        type: Date,
        required: false
    },

    tags: {
        type: [String],
        default: []
    },

    relatedLinks: {
        type: [String],
        validate: {
            validator: function (urls) {
                return urls.every((url) => /^https?:\/\/.+\..+/.test(url))
            },
            message: 'All the related links must be valid URLs.'
        },
        default: []
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
})

taskSchema.pre('save', function (next) {
    this.updatedAt = new Date()
    next()
})

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema)
export default Task
