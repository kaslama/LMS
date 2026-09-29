import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description can not be more than 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;