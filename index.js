const reg = /^((\d)(\d(\d)))\1\2\3\4$/;

const string = '1231231233';

console.log(reg.test(string));
console.log(RegExp.$1);
console.log(RegExp.$2);
console.log(RegExp.$3);
console.log(RegExp.$4);
