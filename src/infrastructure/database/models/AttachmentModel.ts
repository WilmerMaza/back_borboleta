import mongoose from 'mongoose';

const AutoIncrement = require("mongoose-sequence")(mongoose);

const attachmentSchema = new mongoose.Schema({
  id: { type: Number },
  collection_name: {
    type: String,
    default: 'default',
    trim: true
  },
  name: {
    type: String,
    required: [true, 'El nombre del archivo es requerido'],
    trim: true
  },
  file_name: {
    type: String,
    required: [true, 'El nombre del archivo es requerido'],
    trim: true
  },
  mime_type: {
    type: String,
    required: [true, 'El tipo MIME es requerido'],
    trim: true
  },
  disk: {
    type: String,
    default: 'public',
    trim: true
  },
  conversions_disk: {
    type: String,
    default: 'public',
    trim: true
  },
  size: {
    type: String,
    required: [true, 'El tamaño del archivo es requerido']
  },
  original_url: {
    type: String,
    required: [true, 'La URL original es requerida'],
    trim: true
  },
  asset_url: {
    type: String,
    required: [true, 'La URL del asset es requerida'],
    trim: true
  },
  file_path: {
    type: String,
    required: [true, 'La ruta del archivo es requerida'],
    trim: true
  },
  created_by_id: {
    type: Number,
    required: [true, 'El ID del creador es requerido']
  }
}, {
  timestamps: true
});

// Plugin para auto-incrementar el ID
attachmentSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'attachment_id' });

// Índices para optimizar consultas
attachmentSchema.index({ name: 1 });
attachmentSchema.index({ mime_type: 1 });
attachmentSchema.index({ created_by_id: 1 });
attachmentSchema.index({ collection_name: 1 });
attachmentSchema.index({ created_at: -1 });

// Virtual para obtener el tamaño en formato legible
attachmentSchema.virtual('size_formatted').get(function() {
  const bytes = parseInt(this.size);
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual para verificar si es una imagen
attachmentSchema.virtual('is_image').get(function() {
  return this.mime_type.startsWith('image/');
});

// Virtual para verificar si es un video
attachmentSchema.virtual('is_video').get(function() {
  return this.mime_type.startsWith('video/');
});

// Configurar JSON transform
attachmentSchema.set('toJSON', {
  virtuals: true,
  transform: function(_doc: any, ret: any) {
    return ret;
  }
});

export default mongoose.model('Attachment', attachmentSchema);