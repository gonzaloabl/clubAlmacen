import mongoose from 'mongoose';

const systemConfigSchema = mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'global_config' },
  isMaintenanceMode: { type: Boolean, default: false }, // 👈 El interruptor
  lastMaintenanceBy: { type: String }, // Quién lo activó
  lastMaintenanceDate: { type: Date }
}, {
  timestamps: true,
});

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);
export default SystemConfig;