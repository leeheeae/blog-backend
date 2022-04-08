# 블로그 프로젝트 backend

### 사용 라이브러리

`eslint`, `prettier`, `eslint-config-prettier`, `nodemon`, `koa`, `koa-router`, `koa-bodyparser`, `mongoose`, `dotenv`, `esm`, `joi`, `bcrypt`

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

**내용 길이 제한**

- body의 길이가 200자 이상이면 뒤에 ...을 붙이고 문자열을 자르는 기능을 구현
- find()를 통해 조회한 데이터는 mongoose 문서 인스턴스의 형태이므로 데이터를 바로 변형할 수 없음
- toJSON()함수를 실행하여 JSON 형태로 변환한 뒤 필요한 변형을 일으켜주는 방식을 사용
- lean()함수를 이용하여 처음부터 데이터를 JSON 형태로 받아오는 방식도 있음

```javascript
//받아온 데이터를 json형태로 바꾸는 방식
ctx.body = posts
  .map((post) => post.toJSON())
  .map((post) => ({
    ...post,
    body: post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
  }));
```

```javascript
//처음부터 데이터는 json형태로 받아오는 방식
const posts = await Post.find()
  .sort({
    _id: -1,
  })
  .limit(10)
  .skip((page - 1) * 10)
  .lean()
  .exec();
const postCount = await Post.countDocuments().exec();
ctx.set('Last-Page', Math.ceil(postCount / 10));
ctx.body = posts.map((post) => ({
  ...post,
  body: post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
}));
```

---

## JWT

> JSON Web Token의 약자, 데이터가 JSON으로 이루어져 있는 토큰을 의미
> 두 개체가 서로 안전하게 정보를 주고 받을 수 있도록 웹 표준으로 정의된 기술

### 세션 기반 인증과 토큰 기반 인증의 차이

#### 세션 기반 인증 시스템

> 서버가 사용자가 로그인 중임을 기억하고 있다는 뜻

- 세션기반 인증 시스템에서 사용자가 로그인하면, 서버는 세션 저장소에 사용자의 정보를 조회하고 세션 id를 발급
- 발급된 id는 주로 브라우저의 쿠키에 저장
- 사용자가 다른 요청을 보낼 때마다 서버는 세션저장소에서 세션을 조회한 후 로그인 여부를 결정하여 작업을 처리하고 응담
- 세션 저장소를 주로 메모리, 디스크, 데이터베이스 등을 사용

**단점**

- 서버를 확장하기가 번거로워질 수 있다는 점
- 서버의 인스턴스가 여러개가 된다면, 모든 서버끼리 같은 세션을 공유해야 하므로 세션 전용 데이터베이스를 만들어야 할 뿐 아니라 신경써야할 것도 많음

#### 토큰 기반 인증 시스템

- 토큰은 로그인 이후 서버가 만들어주는 문자열
- 문자열 안에는 사용자의 로그인 정보가 들어있고, 해당 정보가 서버에서 발급 되었음을 증명하는 서명이 들어있음
- 해싱 알고리즘을 통해 만들어지는데, 주로 `HMAC SHA256` 혹은 `RSA SHA256`알고리즘이 사용됨
- 서버에서 만들어준 토큰은 서명이 있기 때문에 무결성이 보장됨
  - 무결성이란 정보가 변경되거나 위조되지 않았으면 의미하는 성질
- 사용자가 로그인하면 서버에서 사용자에게 해당 사용자의 정보를 지니고 있는 토큰을 발급해주고, 추후 사용자가 다른 API를 요청하게 될 때 발급받은 토큰과 함께 요청하게 됨
- 서버는 해당 토큰이 유효한지 검사하고 결과에 따라 작업을 처리하고 응답

**장점**

- 서버에서 사용자 로그인 정보를 기억하기 위해 사용하는 리소스가 적음
- 사용자쪽에서 로그인 상태를 지닌 토큰을 가지고 있으므로 서버의 확장성이 높
