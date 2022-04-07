# 블로그 프로젝트 backend

### 사용 라이브러리

`eslint`, `prettier`, `eslint-config-prettier`, `nodemon`, `koa`, `koa-router`, `koa-bodyparser`, `mongoose`, `dotenv`, `esm`

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
