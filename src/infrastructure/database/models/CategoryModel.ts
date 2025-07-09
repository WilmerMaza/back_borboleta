import mongoose from 'mongoose';
import slugify from 'slugify';
import { ICategory } from '../../../domain/entities/Category';

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  slug: { 
    type: String, 
    unique: true,
    sparse: true
  },
  description: { 
    type: String,
    trim: true
  },
  type: { 
    type: String,
    default: 'product'
  },
  parent_id: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null
  },
  category_image_id: { 
    type: Number
  },
  category_icon_id: { 
    type: Number
  },
  commission_rate: { 
    type: Number,
    min: [0, 'La comisión no puede ser negativa'],
    max: [100, 'La comisión no puede ser mayor al 100%']
  },
  category_meta_image_id: { 
    type: Number
  },
  meta_title: { 
    type: String,
    trim: true
  },
  meta_description: { 
    type: String,
    trim: true
  },
  status: { 
    type: Boolean, 
    default: true 
  },
  created_by_id: { 
    type: Number
  },
  numeric_id: {
    type: Number,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent_id'
});


categorySchema.pre('save', async function (next) {
  if (!this.slug && this.name) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (await mongoose.models.Category.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    this.slug = uniqueSlug;
  }

  // Asignar numeric_id automáticamente si no existe
  if (!this.numeric_id) {
    const last = await mongoose.models.Category.findOne({ numeric_id: { $exists: true } })
      .sort({ numeric_id: -1 })
      .select('numeric_id');
    this.numeric_id = last && last.numeric_id ? last.numeric_id + 1 : 1;
  }

  next();
});


categorySchema.methods.populateSubcategories = async function() {
  return await this.populate('subcategories');
};

export default mongoose.model<ICategory & mongoose.Document>('Category', categorySchema); 