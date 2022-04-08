import Joi from 'joi';
import User from '../../models/user';

/*
POST /api/auth/register
{
    username: string,
    password: string
}
*/
export const register = async (ctx) => {
  //body 검증
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  });
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }
  const { username, password } = ctx.request.body;
  try {
    //username이 이미 존재하는 지 확인
    const exists = await User.findByUsername(username);
    if (exists) {
      ctx.status = 409;
      return;
    }
    const user = new User({
      username,
    });
    await user.setPassword(password);
    await user.save(); //데이터 베이스에 저장
    ctx.body = user.serialize();
  } catch (err) {
    ctx.throw(500, err);
  }
};

//로그인
export const login = async (ctx) => {};

//로그인 상태 확인
export const check = async (ctx) => {};

//로그아웃
export const logout = async (ctx) => {};
