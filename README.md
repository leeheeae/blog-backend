# 블로그 프로젝트 backend

### 사용 라이브러리

`eslint`, `prettier`, `eslint-config-prettier`, `nodemon`, `koa`, `koa-router`, `koa-bodyparser`, `mongoose`, `dotenv`, `esm`, `joi`

---

## 데이터베이스의 스키마와 모델

- 스키마 : 컬렉션에 들어가는 문서 내부의 각 필드가 어떤 형식으로 되어 있는지 정의하는 객체
- 모델 : 스키마를 사용하여 만드는 인스턴스로, 데이터 베이스에서 실제 작업을 처리할 수 있는 함수들을 지니고 있는 객체

<br/>

### 블로그 프로젝트 - 포스트 스키마

> 스키마를 만들 때는 mongoose 모듈의 Schema를 사용하여 정의
> 각 필드 이름과 필드의 데이터 타입 정보가 들어가 있는 객체를 작성
> 필드의 기본값으로는 default 값을 설정

<br/>

**[필드 이름과 데이터 타입 설정]**
|설명| 필드이름 | 데이터타입|
|---|---|---|
|제목 | title | 문자열|
|내용 | body | 문자열|
|태그 | tags | 문자열 배열|
|작성일 | publishedDate | 날짜|

<br/>

**[Schema에서 지원하는 타입]**
|타입|설명|
|---|---|
|String|문자열|
|Number|숫자|
|Date|날짜|
|Buffer|파일을 담을 수 있는 버퍼|
|Boolean|true 또는 false 값|
|Mixed(Schema.Types.Mixed)|어떤 데이터도 넣을 수 있는 형식|
|ObjectId(Schema.Types.ObjectId)|객체 아이디, 주로 다른 객체를 참조할 때 넣음|
|Array|배열 형태의 값으로 []로 감싸서 사용|

### ObjectId 검증

- 올바른 ObjectId인지 확인하고 잘못된 id를 전달했을 때 400 Bad Request 오류를 띄워 주는 것이 맞음
- 검증코드를 미들웨어로 작성하여 라우트에 쉽게 적용할 수 있음

```javascript
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;
ObjectId.isValid(id);
```

### Request Body 검증

- 전달 받은 body를 검증해줘야함
- 클라이언트가 값을 제대로 전달하지 않았을 경우 400 오류를 발생시켜야함
- joi 라이브러리를 이용하여 작성예정

### 페이지네이션 구현

**포스트를 역순으로 불러오기**

- exec()하기 전에 sort()구문을 넣어 구현
- key의 값이 1이면 오름차순, -1이면 내림차순

```javascript
const posts = await Post.find()
  .sort({
    _id: -1,
  })
  .exec();
```

**보이는 개수 제한**

- limit()함수를 사용
- 열개로 제한한다면 limit(10) 형식으로 작성

```javascript
const posts = await Post.find()
  .sort({
    _id: -1,
  })
  .limit(10)
  .exec();
```

**페이지 기능 구현**

- skip 함수를 사용
- `(page - 1) * 10`를 이용하여 각 페이지에 해당되는 데이터 가져옴
- page 값은 query로 받아오도록 설정
  - query는 문자열이기 때문에 숫자로 변경해주어야함
- 값이 없을 경우 1로 간주

```javascript
const page = parseInt(ctx.query.page || '1', 10);

if (page < 1) {
    ctx.status = 400;
return;
}

try {
//find함수 호출 후에는 exec를 붙여줘야 서버에 쿼리를 요청함
const posts = await Post.find()
    .sort({
    _id: -1,
    })
    .limit(10)
    .skip((page - 1) * 10)
    .exec();
ctx.body = posts;
```

**마지막 페이지 알려주기**

- 클라이언트가 더욱 편하게 데이터를 전달하기 위해 커스텀 헤더를 설정하여 마지막 페이지를 알려줌

```javascript
const postCount = await Post.countDocuments().exec();
ctx.set('Last-Page', Math.ceil(postCount / 10));
```
