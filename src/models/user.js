import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
  username: String,
  hashedPassword: String,
});

UserSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

UserSchema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result;
};

//응답할 데이터에 hashedPassword 필드 제거
UserSchema.methods.serialize = function () {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};

UserSchema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};

UserSchema.methods.generateToken = function () {
  const token = jwt.sign(
    //첫번째 파라미터에는 토큰 안에 집어넣고 싶은 데이터를 넣음
    {
      _id: this.id,
      username: this.username,
    },
    //두번째 파라미터에는 JWT 암호
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
    //유효기간
  );
  return token;
};

const User = mongoose.model('User', UserSchema);
export default User;
