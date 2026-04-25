import mongoose, { Schema, Document } from 'mongoose';

export interface IRecruiterDocument extends Document {
  email: string;
  companyName: string;
  role: string;
}

const RecruiterSchema: Schema = new Schema({
  email: { type: String, required: true },
  companyName: { type: String, required: true },
  role: { type: String, required: true }
}, { timestamps: true });

RecruiterSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

export const RecruiterModel = mongoose.model<IRecruiterDocument>('Recruiter', RecruiterSchema);
