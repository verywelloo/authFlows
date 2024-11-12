const Review = require("../models/Review");
const Book = require("../models/Book");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermission } = require("../utils");

const createReview = async (req, res) => {
  const { book: bookId } = req.body;
  const isValidBook = await Book.findOne({ _id: bookId }); // check for real available book
  if (!isValidBook) {
    throw new CustomError.NotFoundError(`No book with id : ${bookId}`);
  }

  // check for 1 review per book
  const alreadySubmitted = await Review.findOne({
    book: bookId,
    user: req.user.userId,
  });
  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      "Already submitted review for this book"
    );
  }

  req.body.user = req.user.userId;

  const review = await Review.create(req.body);

  res.status(StatusCodes.CREATED).json({ review });
};
const getAllReviews = async (req, res) => {
  const review = await Review.find({}).populate({
    path: "book",
    select: "name author price",
  });
  res.status(StatusCodes.OK).json({ review, count: review.length });
};

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id : ${reviewId}`);
  }
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id : ${reviewId}`);
  }

  checkPermission(req.user, review.user); // first argument for login user, second for resource user

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();

  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(`No review with id : ${reviewId}`);
  }

  checkPermission(req.user, review.user); // first argument for login user, second for resource user

  await review.deleteOne();

  res.status(StatusCodes.OK).json({ msg: "Success! Review removed" });
};

// set up here for using Review model
const getSingleBookReviews = async (req, res) => {
  const { id: bookId } = req.params;
  const review = await Review.find({ book: bookId });
  res.status(StatusCodes.OK).json({ review, count: review.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleBookReviews,
};
