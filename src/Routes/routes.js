const express = require('express');
const router = express.Router();
const blogController=require("../Controllers/blogController")
const authorController = require("../Controllers/authorController")

//--------------------------------------------------------//
router.get("/test-me", function (req, res) {
    res.send("My server is running awesome!")
})
//--------------------------------------------------------//

router.post("/authors/create", authorController.createAuthor)
// router.post("/login", authorController.authorLogin) 
router.post ("/blogs", blogController.createBlog)
router.get("/blogs", blogController.getBlogs)
router.put("/blogs/:blogId", blogController.updateBlogById)
router.delete("/blogs/:blogId", blogController.deleteBlogById)
router.delete("/blog" ,blogController.deleteBlogByQuery)


module.exports = router;