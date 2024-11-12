const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide review title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide review text"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.ObjectId,
      ref: "Book",
      required: true,
    },
  },
  { timestamp: true }
);

ReviewSchema.index({ book: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (bookId) {
  const result = await this.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
};

ReviewSchema.statics.calculateAverageRating = async function (bookId) {
  const result = await this.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    await this.model("Book").findOneAndUpdate(
      { _id: bookId },
      {
        averageRating: Math.ceil(result[0]?.averageRating || 0),
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.book);
});

ReviewSchema.post("remove", async function () {
  await this.constructor.calculateAverageRating(this.book);
});

module.exports = mongoose.model("Review", ReviewSchema);
