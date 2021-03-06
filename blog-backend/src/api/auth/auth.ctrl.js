import Joi from '@hapi/joi'
import User from '../../models/user';

/*
  POST /api/auth/register
  {
    username: 'username',
    password: 'password'
  }
*/
export const register = async ctx => {
  // request body 검증
  const schema = Joi.object().keys({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(20)
      .required(),
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
    // checked username
    const exists = await User.findByUsername(username);
    if (exists) {
      ctx.status = 409; // Conflict
      return;
    }

    const user = new User({
      username,
    });
    await user.setPassword(password);
    await user.save();  // save to db

    // 응답할 데이터에서 hashedPassword 필드 제거
    ctx.body = user.serialize();

    const token = user.generateToken();
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 days
      httpOnly: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  POST /api/auth/login
  {
    username: 'username',
    password: 'password',
  }
*/
export const login = async ctx => {
  const { username, password } = ctx.request.body;

  // checked if username, password exists
  if (!username || !password) {
    ctx.status = 401; // Unauthorized;
    return;
  }

  try {
    const user = await User.findByUsername(username);
    // checked if user exists
    if (!user) {
      ctx.status = 401;
      return;
    }
    const valid = await user.checkPassword(password);
    // wrong password
    if (!valid) {
      ctx.status = 401;
      return;
    }
    ctx.body = user.serialize();

    const token = user.generateToken();
    ctx.cookies.set('access_token', token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 days
      httpOnly: true,
    });
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  GET /api/auth/check
*/
export const check = async ctx => {
  const { user } = ctx.state;
  if (!user) {
    // not login
    ctx.status = 401
    return;
  }
  ctx.body = user;
};

/*
  POST /api/auth/logout
*/
export const logout = async ctx => {
  ctx.cookies.set('access_token');
  ctx.status = 204; //  No Content
};