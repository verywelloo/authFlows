const Book = require("../models/Book");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const createBook = async (req, res) => {
  req.body.user = req.user.userId;

  const book = await Book.create(req.body);

  res.status(StatusCodes.CREATED).json({ book });
};

const getAllBooks = async (req, res) => {
  const { name, author, numericFilters, sort, fields } = req.query;
  let queryObject = {};

  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }

  if (author) {
    queryObject.author = { $regex: author, $options: "i" };
  }

  if (numericFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "<": "$lt",
      "<=": "$lte",
      "=": "$eq",
    };
    const regex = /\b(<|>|<=|=|>=)\b/g;
    let filters = numericFilters.replace(
      regex,
      (match) => `-${operatorMap[match]}-`
    );
    let options = ["price", "averageRating"];
    filters = filters.split(",").forEach((item) => {
      let [title, operator, value] = item.split("-");
      if (options.includes(title)) {
        queryObject[title] = { [operator]: Number(value) };
      }
    });
  }

  let result = Book.find(queryObject).select(
    "name author image price averageRating"
  );

  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("createdAt");
  }
  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }

  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const books = await result;
  res.status(StatusCodes.OK).json({ books, count: books.length });
};

const getBook = async (req, res) => {
  const { id: bookId } = req.params;

  const book = await Book.findOne({ _id: bookId }).populate("reviews");
  if (!book) {
    throw new CustomError.NotFoundError(`No book with id : ${bookId}`);
  }

  res.status(StatusCodes.OK).json({ book });
};

const updateBook = async (req, res) => {
  const {
    params: { id: bookId },
    body: { name, author, description },
  } = req;

  if (name === "" || author === "" || description === "") {
    throw new CustomError.BadRequestError("Information fields cannot be empty");
  }

  const book = await Book.findOneAndUpdate({ _id: bookId }, req.body, {
    runValidator: true,
    new: true,
  });

  if (!book) {
    throw new CustomError.NotFoundError(`No book with id : ${bookId}`);
  }

  res.status(StatusCodes.OK).json({ book });
};

const deleteBook = async (req, res) => {
  const { id: bookId } = req.params;

  const book = await Book.findOne({ _id: bookId });
  if (!book) {
    throw new CustomError.NotFoundError(`No book with id : ${bookId}`);
  }

  await book.deleteOne();

  res.status(StatusCodes.OK).send("Success! Book removed.");
};

const uploadImage = async (req, res) => {
  if (!req.file) {
    throw new CustomError.BadRequestError("No File Uploaded");
  }

  const bookImage = req.file.image;
  if (!bookImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please Upload Image");
  }

  const maxSize = 1024 * 1024;
  if (bookImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload image smaller than 1MB"
    );
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );

  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  getAllBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  uploadImage,
};
