const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please provide book name"],
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    author: {
      type: String,
      required: [true, "Please provide author name"],
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    description: {
      type: String,
      required: [true, "Please provide book description"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

BookSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "book",
  justOne: false,
});

BookSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ book: this._id });
});

module.exports = mongoose.model("Book", BookSchema);
