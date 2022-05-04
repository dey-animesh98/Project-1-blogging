const authorModel = require("../Models/authorModel")
const blogModel = require("../Models/blogModel")
const ObjectId = require("mongoose").Types.ObjectId

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}
const isValidRequest = function (request) {
    return (Object.keys(request).length > 0)
}

// Blog Creation
const createBlog = async function (req, res) {
    try {
        const blogData = req.body
        const { title, body, authorId, category, subcategory, tags, isPublished } = blogData

        if (!isValidRequest(blogData)) return res.status(400).send({ status: false, message: "No input by user." })

        if (!isValid(title)) return res.status(400).send({ status: false, msg: "Please Fill the required field title!" }) //required filled can't be blank

        if (!isValid(body)) return res.status(400).send({ status: false, msg: "Please Fill the required field body!" })

        if (!isValid(authorId)) return res.status(400).send({ status: false, msg: "Please Fill the required field Author details!" })

        if (!isValid(category)) return res.status(400).send({ status: false, msg: "Please Fill the required field catergory!" })

        // Validation of ID format
        if (!ObjectId.isValid(authorId)) return res.status(400).send({ status: false, msg: "Not a valid author ID" })

        // Validation of id exist or not
        let findAuthorId = await authorModel.findById(authorId)
        if (!findAuthorId) return res.status(404).send({ status: false, msg: "Author Not found. Please enter a valid Author id." })

        const validBlogData = {title, body, authorId, category}

        if (tags) {
            if (Array.isArray(tags)) {
                validBlogData['tags'] = [...tags]
            }
            if (Object.prototype.toString.call(tags) === '[object string ]') {
                validBlogData['tags'] = [tags]
            }
        }
        if (subcategory) {
            if (Array.isArray(subcategory)) {
                validBlogData['subcategory'] = [...subcategory]
            }
            if (Object.prototype.toString.call(subcategory) === '[object string]') {
                validBlogData['subcategory'] = [subcategory]
            }
        }

        const newBlog = await blogModel.create(blogData);
        return res.status(201).send({ status: true, data: newBlog });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

// GET Blogs
const getBlogs = async function (req, res) {
    try {
        const authorQuery = req.query
        const filter = { isDeleted: false, isPublished: true }

        const { authorId, category, tags, subcategory } = authorQuery

        if (authorId) {
            if (!ObjectId.isValid(authorId)) {
                return res.send({ status: false, msg: "not valid id" })
            }
            if (ObjectId.isValid(authorId)) {
                filter['authorId'] = authorId
            }
        }

        if (isValid(category)) {
            filter['category'] = category.trim()
        }
        if (isValid(tags)) {
            const tagsArr = tags.trim().split(',').map(t => t.trim())
            filter['tags'] = { $all: tagsArr }
        }
        if (isValid(subcategory)) {
            const subcatArr = subcategory.trim().split(',').map(s => s.trim())
            filter['subcategory'] = { $all: subcatArr }
        }

        const allBlogs = await blogModel.find(filter)
        if (Array.isArray(allBlogs) && allBlogs.length == 0) return res.status(404).send({ status: false, message: "No Blogs found." })
        res.status(200).send({ status: true, data: allBlogs })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

// Update Blog 
const updateBlogById = async function (req, res) {
    try {
        const requestBody = req.body
        const blogId = req.params.blogId
        const authorToken = req.authorId

        // ID validation
        if (!ObjectId.isValid(blogId)) return res.status(400).send({ status: false, msg: "Not a valid BLOG ID" })
        if (!ObjectId.isValid(authorToken)) return res.status(400).send({ status: false, msg: "Not a valid author id from token." })
        // Id verification
        const blogDetails = await blogModel.findOne({ _id: blogId, isDeleted: false, deletedAt: null })
        if (!blogDetails) return res.status(404).send({ status: false, msg: "Blog not found." })

        if (blogDetails.authorId.toString() != authorToken) return res.status(403).send({ status: false, message: "Unauthorize Access." })
        if (!isValidRequest(requestBody)) return res.status(400).send({ status: false, message: "No input by user for update." })

        const { title, body, tags, category, subcategory, isPublished } = requestBody
        const updatedBlog = {}

        if (isValid(title)) {
            if (!Object.prototype.hasOwnProperty.call(updatedBlog, '$set'))
                updatedBlog['$set'] = {}
            updatedBlog['$set']['title'] = title
        }

        if (isValid(body)) {
            if (!Object.prototype.hasOwnProperty.call(updatedBlog, '$set'))
                updatedBlog['$set'] = {}
            updatedBlog['$set']['body'] = body
        }

        if (isValid(category)) {
            if (!Object.prototype.hasOwnProperty.call(updatedBlog, '$set'))
                updatedBlog['$set'] = {}
            updatedBlog['$set']['category'] = category
        }

        if (isValid(isPublished !== undefined)) {
            if (!Object.prototype.hasOwnProperty.call(updatedBlog, '$set'))
                updatedBlog['$set'] = {}
            updatedBlog['$set']['isPublished'] = isPublished
            updatedBlog['$set']['publishedAt'] = isPublished ? new Date() : null
        }

        if (isValid(tags)) {
            if (!Object.prototype.hasOwnProperty.call(updatedBlog, '$addToSet'))
                updatedBlog["$addToSet"] = {}
            if (Array.isArray(tags)) {
                updatedBlog['$addToSet']['tags'] = { $each: [...tags] }
            }
            if (typeof tags === 'string') {
                updatedBlog['$addToSet']['tags'] = tags
            }
        }

        if (isValid(subcategory)) {
            if (!Object.prototype.hasOwnProperty.call(updatedBlog, '$addToSet'))
                updatedBlog["$addToSet"] = {}
            if (Array.isArray(subcategory)) {
                updatedBlog['$addToSet']['subcategory'] = { $each: [...subcategory] }
            }
            if (typeof subcategory === 'string') {
                updatedBlog['$addToSet']['subcategory'] = subcategory
            }
        }

        const validUpdatedBlog = await blogModel.findOneAndUpdate({ _id: blogId }, updatedBlog, { new: true })
        res.status(200).send({ status: true, message: "Updated Succesfully", data: validUpdatedBlog })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

// Delete by Id
const deleteBlogById = async function (req, res) {
    try {
        const blogId = req.params.blogId
        const authorToken = req.authorId
        // ID validation
        if (!ObjectId.isValid(blogId)) return res.status(400).send({ status: false, msg: "Not a valid BLOG ID" })
        if (!ObjectId.isValid(authorToken)) return res.status(400).send({ status: false, msg: "Not a valid author id from token." })
        // Id verification
        const blogDetails = await blogModel.findOne({ _id: blogId, isDeleted: false, deletedAt: null })
        if (!blogDetails) return res.status(404).send({ status: false, msg: "Blog not found." })

        if (blogDetails.authorId.toString() != authorToken) return res.status(403).send({ status: false, message: "Unauthorize Access." })
        await blogModel.findOneAndUpdate({ _id: blogId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        res.status(200).send({ status: true, message: "Blog Deleted Succesfully." })
    }
    catch (err) {
        return res.status(500).send({ msg: "Error", error: err.message })
    }
}

// Delete by Query
const deleteBlogByQuery = async function (req, res) {
    try {
        const authorQuery = req.query
        const authorToken = req.authorId
        const filter = { isDeleted: false, deletedAt: null }

        if (!ObjectId.isValid(authorToken)) return res.status(400).send({ status: false, msg: "Not a valid author id from token." })
        if (!isValidRequest(authorQuery)) return res.status(400).send({ status: false, message: "No input by user." })

        // if (isValidRequest(authorQuery)) {
            const { authorId, category, tags, subcategory, isPublished } = authorQuery

            if (authorId) {
                if (!ObjectId.isValid(authorId)) {
                    return res.send({ status: false, msg: "not valid id" })
                }
                if (ObjectId.isValid(authorId)) {
                    filter['authorId'] = authorId
                }
            }
            if (isValid(category)) {
                filter['category'] = category.trim()
            }
            if (isValid(tags)) {
                const tagsArr = tags.trim().split(',').map(t => t.trim())
                filter['tags'] = { $all: tagsArr }
            }
            if (isValid(subcategory)) {
                const subcatArr = subcategory.trim().split(',').map(s => s.trim())
                filter['subcategory'] = { $all: subcatArr }
            }
            if (isValid(isPublished)) {
                filter['isPublished'] = isPublished
            }
        

        const filterdBlogs = await blogModel.find(filter)
        if (Array.isArray(filterdBlogs) && filterdBlogs.length === 0) return res.status(404).send({ status: false, message: "No Blogs Found matching your query" })

        let blogToDelete = filterdBlogs.map(blog => {
            if (blog.authorId.toString() === authorToken)
                return blog._id

        })
        if (blogToDelete[0] === undefined)
            return res.status(404).send({ status: false, message: "No blogs Found to delete." })

        let dlet = await blogModel.updateMany({ _id: { $in: blogToDelete } }, { $set: { isDeleted: true, deletedAt: new Date() } })
        res.status(200).send({ status: true, message: "Blogs Delete Succesfully.", data: dlet })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.msg })
    }
}

module.exports.createBlog = createBlog
module.exports.getBlogs = getBlogs
module.exports.updateBlogById = updateBlogById
module.exports.deleteBlogById = deleteBlogById;
module.exports.deleteBlogByQuery = deleteBlogByQuery;




