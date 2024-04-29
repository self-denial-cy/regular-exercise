# 正则表达式攻略

## 1.字符匹配攻略

> 正则表达式是匹配模式，要么匹配字符，要么匹配位置

### 1.1 两种模糊匹配

#### 1.1.1 横向模糊匹配

横向模糊指的是，一个正则可匹配的字符串的长度不是固定的，可以是多种情况的

譬如 `{m,n}` 表示连续出现最少 m 次，最多 n 次

```javascript
const reg = /ab{2,5}c/g;

const string = 'abc abbc abbbc abbbbc abbbbbc abbbbbbc';

console.log(string.match(reg));
```

> g 是正则的一个修饰符，表示全局匹配
>
> 意为在目标字符串中按顺序找到满足匹配模式的所有子串，强调的是【所有】，而不只是【第一个】

#### 1.1.2 纵向模糊匹配

纵向模糊指的是，一个正则匹配的字符串，具体到某一位字符时，可以不是某个确定的字符，可以有多种可能

譬如 `[abc]` 表示该字符可以是 a、b、c 中的任何一个

```javascript
const reg = /a[123]b/g;

const string = 'a0b a1b a2b a3b a4b';

console.log(string.match(reg));
```

### 1.2 字符组

#### 1.2.1 范围表示法

譬如 `[123456abcdefGHIJKLM]` 可以写成 `[1-6a-fG-M]`

如果要匹配 `-` 字符时就不能写成 `[a-z]` 了，因为其表示小写字母中的任何一个字符了

可以写成 `[-az]` 或 `[az-]` 或 `[a\-z]`，要么放在开头，要么放在结尾，要么转义

#### 1.2.2 排除字符组

纵向模糊匹配，有一种情景，某位字符可以是任何东西，就是不能是 a、b、c，此时就是排除字符组的概念

譬如 `[^abc]` 表示是一个除 a、b、c 之外的任意一个字符，`^` 表示求反

#### 1.2.3 常见的简写形式

| 字符组 | 具体含义                                                     |
| ------ | ------------------------------------------------------------ |
| `\d`   | 表示`[0-9]`，表示是一位数字                                  |
| `\D`   | 表示`[^0-9]`，表示除数字外的任意一位字符                     |
| `\w`   | 表示`[0-9a-zA-z_]`，表示数字、大小写字母和下划线             |
| `\W`   | 表示`[^0-9a-zA-Z_]`，表示非数字、大小写字母和下划线的任意一位字符 |
| `\s`   | 表示`[\t\v\n\r\f]`，表示空白符，包括空格、水平制表符、垂直制表符、换行符、回车符、换页符 |
| `\S`   | 表示`[^\t\v\n\r\f]`，非空白符                                |
| `.`    | 表示`[^\n\r\u2028\u2029]`，通配符，表示几乎任意字符，换行符、回车符、行分隔符和段分隔符除外 |

> 如果要匹配任意字符，可以使用 `[\d\D]`、`[\w\W]`、`[\s\S]`、`[^]` 中任一个

### 1.3 量词【重复】

#### 1.3.1 简写形式

| 量词   | 具体含义                                   |
| ------ | ------------------------------------------ |
| `{m,}` | 表示至少出现 m 次                          |
| `{m}`  | 等价于`{m,m}`，表示出现 m 次               |
| `?`    | 等价于`{0,1}`，表示出现一次或不出现        |
| `+`    | 等价于`{1,}`，表示出现至少一次             |
| `*`    | 等价于`{0,}`，表示出现任意次，有可能不出现 |

#### 1.3.2 贪婪匹配与惰性匹配

```javascript
const reg = /\d{2,5}/g;

const string = '123 1234 12345 123456';

console.log(string.match(reg));
```

上述例子中，`/\d{2,5}/g` 表示数字连续出现了 2 到 5 次，会匹配 2、3、4、5 位连续数字

但是其是贪婪的，它会尽可能多的匹配，6 位连续数字它会匹配 5 位，3 位连续数字它会匹配 3 位，反正只要在能力范围内，越多越好

```javascript
const reg = /\d{2,5}?/g;

const string = '123 1234 12345 123456';

console.log(string.match(reg));
```

上述例子中，`/\d{2,5}?/g` 表示虽然 2 到 5 位连续数字都行，但是当匹配到 2 位连续数字后，就不再往下尝试了

通过在量词后加个问号就能实现惰性匹配：

| 惰性量词 | 贪婪量词 |
| -------- | -------- |
| `{m,n}?` | `{m,n}`  |
| `{m,}?`  | `{m,}`   |
| `??`     | `?`      |
| `+?`     | `+`      |
| `*?`     | `*`      |

### 1.4 多选分支

一个模式可以实现横向和纵向模糊匹配，而多选分支可以支持多个子模式任选其一

具体形式：`(p1|p2|p3)` 中 p1、p2、p3 是子模式，用 `|` 管道符分隔，表示其中任一

```javascript
const reg = /good|nice/g;

const string = 'good idea, nice try.';

console.log(string.match(reg));
```

但需要注意，用 `/good|goodbye/` 去匹配 `goodbye` 字符串时，结果是 `good`

而用 `/goodbye|good/` 去匹配 `goodbye` 字符串时，结果是 `goodbye`

也就是说，分支结构是惰性的，当有一个模式匹配上了，后面的模式就不再尝试了

### 1.5 案例分析

#### 1.5.1 匹配 16 进制颜色值

```javascript
const reg = /#[0-9a-zA-Z]{6}|#[0-9a-zA-Z]{3}/g;

const string = '#ffbbad #Fc01DF #FFF #ffE';

console.log(string.match(reg));
```

#### 1.5.2 匹配时间

```javascript
const reg = /^([01][0-9]|[2][0-3]):[0-5][0-9]$/;

console.log(reg.test('23:59'));
console.log(reg.test('02:07'));
```

#### 1.5.3 匹配日期

```javascript
const reg = /^[0-9]{4}-([0][1-9]|[1][0-2])-([0][1-9]|[12][0-9])|[3][0-1]$/;

console.log(reg.test('2024-04-28'));
```

#### 1.5.4 匹配 Windows 操作系统文件路径

```javascript
const reg = /^[a-zA-Z]:\\([^\\:*<>|"?\r\n/]+\\)*([^\\:*<>|"?\r\n/]+)$/;

console.log(reg.test(process.cwd()));
```

#### 1.5.5 匹配 id

```javascript
// const reg = /id=".*?"/;
const reg = /id="[^"]*"/;

const string = '<div id="container" class="main"></div>';

console.log(string.match(reg));
```

## 2. 位置匹配攻略

### 2.1 什么是位置

位置【锚】是相邻字符之间的位置

![位置](./images/location.png)

### 2.2 如何匹配位置

在 ES5 中，共有 6 个锚：

- `^`
- `$`
- `\b`
- `\B`
- `(?=p)`
- `(?!p)`

#### 2.2.1 `^` 和 `$`

- `^` 匹配开头，在多行匹配中匹配行开头
- `$` 匹配结尾，在多行匹配中匹配行结尾

```javascript
const string = 'hello';

const reg = /^|$/g;

console.log(string.replace(reg, '#'));
```

上述例子中，用 `#` 替换开头和结尾【位置可以替换成字符】

```javascript
const string = 'I\nlove\njavascript';

const reg = /^|$/gm;

console.log(string.replace(reg, '#'));
```

上述例子中，使用 `m` 修饰符开启多行匹配模式，这时候 `^` 和 `$` 表示行开头和行结尾

> 需要注意，在大多数正则匹配引擎中，`\r` 和 `\n` 都会被认定开启了新行
>
> 额外，JavaScript 中模板字符串中换行符锁定为 `\n`，不管在什么操作系统中

#### 2.2.2 `\b` 和 `\B`

`\b` 是单词边界，具体就是 `\w` 和 `\W` 之间的位置，也包括 `\w` 和 `^` 之间的位置和 `\w` 和 `$` 	之间的位置

```javascript
const string = '[JS] Lesson_01.mp4';

const reg = /\b/g;

console.log(string.replace(reg, '#'));
```

`\B` 就是 `\b` 反面的意思，非单词边界，在字符串所有位置中，扣掉 `\b` 的位置，剩下的位置都是 `\B` 的

具体来说，就是 `\w` 和 `\w`、`\W` 和 `\W`、`\W` 和 `^`、`\W` 和 `$` 之间的位置

```javascript
const string = '[JS] Lesson_01.mp4';

const reg = /\B/g;

console.log(string.replace(reg, '#'));
```

#### 2.2.3 `(?=p)` 和 `(?!p)`

`(?=p)`，其中 `p` 是一个子模式，即 `p` 之前的位置

譬如，`(?=l)` 表示 `l` 字符之前的位置：

```javascript
const string = 'hello';

const reg = /(?=l)/g;

console.log(string.replace(reg, '#'));
```

而 `(?!p)` 就是 `(?=p)` 的反面意思，字符串所有位置中，扣掉 `(?=p)` 的位置，剩下的位置都是 `(?!p)` 的

```javascript
const string = 'hello';

const reg = /(?!l)/g;

console.log(string.replace(reg, '#'));
```

> 两者学名分别是 `positive lookahead` 和 `negative lookahead`
>
> 也就是正向先行断言和负向先行断言
>
> ES6+ 版本中，支持 `positive lookbehind` 和 `negative lookbehind`
>
> 具体是 `(?<=p)` 和 `(?<!p)`
>
> 也就是匹配 `p` 之后的位置和匹配除 `p` 之后的位置以外的所有位置

### 2.3 位置的特性

对于位置的理解，可以理解成空字符

譬如，`hello` 字符串等价于以下形式：

```javascript
console.log('hello' === '' + 'h' + '' + 'e' + '' + 'l' + '' + 'l' + '' + 'o' + '');
console.log('hello' === '' + '' + 'hello' + '' + '' + '');
```

因此，将 `/^hello$/` 写成 `/^^hello$$$/` 没有任何问题，甚至更复杂的也可以：

```javascript
console.log(/^^hello$$$/.test('hello'));
console.log(/(?=he)^^he(?=\w)llo$\b\b$/.test('hello'));
```

### 2.4 案例分析

#### 2.4.1 不匹配任何东西的正则

```javascript
const string = 'hello';

// const reg = /.^/;
const reg = /$./;

console.log(string.match(reg));
```

#### 2.4.2 数字的千位分隔符表示法

```javascript
const string = '123456789';

const reg = /(?!^)(?=(\d{3})+$)/g;

console.log(string.replace(reg, ','));
```

#### 2.4.3 验证密码问题

要求密码长度 6 到 12 位，由数字、小写字母、大写字母组成，但必须至少包括两种字符

两种思路：

1. 数字和小写字母、数字和大写字母、小写字母和大写字母
2. 不能全是数字、不能全是小写字母、不能全是大写字母

```javascript
// const reg = /((?=.*[0-9])(?=.*[a-z])|(?=.*[0-9])(?=.*[A-Z])|(?=.*[a-z])(?=.*[A-Z]))^[0-9a-zA-Z]{6,12}$/;
const reg = /(?!^[0-9]{6,12}$)(?!^[a-z]{6,12}$)(?!^[A-Z]{6,12}$)^[0-9a-zA-Z]{6,12}$/;

const string = '1qazXSW2';

console.log(string.match(reg));
```

## 3. 括号的作用

### 3.1 分组和分支结构

#### 3.1.1 分组

```javascript
const reg = /(ab)+/g;

const string = 'ababa abbb ababab';

console.log(string.match(reg));
```

#### 3.1.2 分支结构

```javascript
const reg = /^I love (JavaScript|Regular Expression)$/;

console.log(reg.test('I love JavaScript'));
console.log(reg.test('I love Regular Expression'));
```

### 3.2 分组引用

> 这是括号一个重要的作用，有了它，就可以进行数据提取，以及更强大的替换操作

#### 3.2.1 提取数据

```javascript
const reg = /^(\d{4})-(\d{2})-(\d{2})$/;

const string = '2024-04-29';

console.log(string.match(reg));
```

> `match` 执行返回一个数组，第一个元素是整体匹配结果，然后是各个分组【括号里】匹配的内容，然后是匹配下标，最后是输入的文本
>
> 另外，正则表达式是否有 `g` 修饰符，`match` 返回的数组格式是不一样的

另外也可以使用正则实例对象的 `exec` 方法：

```javascript
const reg = /^(\d{4})-(\d{2})-(\d{2})$/;

const string = '2024-04-29';

console.log(reg.exec(string));
```

还可以使用构造函数的全局属性 `$1` 至 `$9` 来获取：

```javascript
const reg = /^(\d{4})-(\d{2})-(\d{2})$/;

const string = '2024-04-29';

reg.test(string);
// reg.exec(string);
// string.match(reg);

console.log(RegExp.$1);
console.log(RegExp.$2);
console.log(RegExp.$3);
```

> 不推荐，该特性已弃用

#### 3.2.2 替换

```javascript
const reg = /^(\d{4})-(\d{2})-(\d{2})$/;

const string = '2024-04-29';

string.replace(reg, function () {
  console.log(arguments);
});

console.log(string.replace(reg, '$2/$3/$1'));
```

### 3.3 反向引用

除了使用相应 API 来引用分组，也可以在正则本身里引用分组，但只能引用之前出现的分组，即反向引用

```javascript
const reg = /^\d{4}(-|\/|\.)\d{2}(-|\/|\.)\d{2}$/;

console.log(reg.test('2024-04-29'));
console.log(reg.test('2024/04/29'));
console.log(reg.test('2024.04.29'));
console.log(reg.test('2024-04/29'));
```

> 上述例子中，虽然匹配了要求的情况，但是也匹配了 `2024-04/29` 这样的错误数据

```javascript
const reg = /^\d{4}(-|\/|\.)\d{2}\1\d{2}$/;

console.log(reg.test('2024-04-29'));
console.log(reg.test('2024/04/29'));
console.log(reg.test('2024.04.29'));
console.log(reg.test('2024-04/29'));
```

> 上述例子中，通过 `\1` 引用了之前的分组，不管它匹配到了什么，都匹配那个同样的具体某个字符

#### 3.3.1 括号嵌套怎么办

```javascript
const reg = /^((\d)(\d(\d)))\1\2\3\4$/;

const string = '1231231233';

console.log(reg.test(string)); // true
console.log(RegExp.$1); // 123
console.log(RegExp.$2); // 1
console.log(RegExp.$3); // 23
console.log(RegExp.$4); // 3
```

#### 3.3.2 `\10` 表示什么

