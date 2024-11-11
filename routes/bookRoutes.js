const express = require("express");
const router = express.Router();

const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  createBook,
  getAllBooks,
  getBook,
  updateBook,
  deleteBook,
  uploadImage,
} = require("../controllers/bookController");

router
  .route("/")
  .get(getAllBooks)
  .post([authenticateUser, authorizePermissions("admin")], createBook);
router
  .route("/:id")
  .get(authenticateUser, getBook)
  .patch([authenticateUser, authorizePermissions("admin")], updateBook)
  .delete([authenticateUser, authorizePermissions("admin")], deleteBook);
router
  .route("/uploadImage")
  .post([authenticateUser, authorizePermissions("admin")], uploadImage);

module.exports = router;
