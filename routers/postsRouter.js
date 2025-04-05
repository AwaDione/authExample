const express = require('express')
const router = express.Router()
const postsController = require('../controllers/postsController')
const { identifier } = require('../middlewares/identification')

router.get('/all-posts',postsController.getPosts)
router.get('/single-post',postsController.singlePost)
// router.get('/sigle-post',postsController.signin)
router.post('/create-post',identifier, postsController.createPost)

router.put('/update-post',identifier,postsController.updatePost)
// router.delete('/delete-post',identifier,postsController.verifyVerificationCode)


module.exports = router;    