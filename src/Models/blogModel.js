const mongoose = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;

const blogSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true
        },
        body: {
            type: String,
            required: [true, "Body is required"],
            trim: true
        },
        authorId: {
            type: objectId,
            refs: 'Author',
            required: [true, "Author Id is required"],
            trim: true
        },
        tags: [{
            type:String, 
            trim: true
        }],
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true
        },
        subcategory:  [{
            type:String, 
            trim: true
        }],
        isPublished: {
            type: Boolean,
            default: false
        },
        publishedAt: {
            type: Date,
            default:null
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default:null
        }
    },
    { timestamps: true }
)


module.exports = mongoose.model('Blog', blogSchema);