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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para subcategorías
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent_id'
});

// Generador automático de slug único
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
  next();
});

// Método para poblar subcategorías
categorySchema.methods.populateSubcategories = async function() {
  return await this.populate('subcategories');
};

export default mongoose.model<ICategory & mongoose.Document>('Category', categorySchema); 