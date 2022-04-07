import Post from '../../models/post';

/* 
포스트 작성
POST /api/posts
{ title, body } 
*/
export const write = async (ctx) => {
  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
  });
  try {
    await post.save();
    ctx.body = post;
  } catch (err) {
    ctx.throw(500, err);
  }
};

/* 
포스트 목록 조회
GET /api/posts
*/
export const list = async (ctx) => {
  try {
    //find함수 호출 후에는 exec를 붙여줘야 서버에 쿼리를 요청함
    const posts = await Post.find().exec();
    ctx.body = posts;
  } catch (err) {
    ctx.throw(500, err);
  }
};

/* 
특정 포스트 조회
GET  /api/posts/:id
*/
export const read = async (ctx) => {
  const { id } = ctx.params;
  try {
    const post = await Post.findById(id).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (err) {
    ctx.throw(500, err);
  }
};

/* 
특정 포스트 제거
DELETE /api/posts/:id
*/
export const remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204;
  } catch (err) {
    ctx.throw(500, err);
  }
};

/* 
포스트 수정(특정 필드 변경)
PATCH /api/posts/:id
{ title, body } 
*/
export const update = async (ctx) => {
  const { id } = ctx.params;
  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true,
    });
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (err) {
    ctx.throw(500, err);
  }
};
