/*
  常见js方法的手写实现
*/

// instanceOf 
function myInstanceOf(left, right) {
  // 实例通过__proto__遍历
  while (left.__proto__) {
    if (left.__proto__ === right.prototype)
      return true
    left = left.__proto__
  }
  return false
}

class A {
  constructor() {
    this.a = 1
  }
  aMethod() { }
}

class Achild extends A {
  constructor() {
    super()
    this.achild = 1
  }
  aChildMethod() { }
}
let a = new Achild()
console.log('instanceof', myInstanceOf(a, A))

// new 操作符
function myNew() {
  function Myclass() {
    this.a = 1
  }

  Myclass.prototype.getA = function () {
    return this.a
  }

  let obj = {}
  Myclass.call(obj)
  obj.__proto__ = Myclass.prototype
  return obj
}
console.log('new', myNew(), myNew().getA())

// call和apply绑定作用域
function myCall(fn, obj) {
  obj.fn = fn
  let arg = []
  arguments[2] && (arg = [...arguments].slice(2))
  obj.fn(...arg)
  delete obj.fn
}
function myApply(fn, obj, arr) {
  obj.fn = fn
  obj.fn(...arr)
  delete obj.fn
}
function myBind(fn, obj, arr) {
  return function () {
    obj.fn = fn
    obj.fn(...arr)
    delete obj.fn
  }
}

a = {}
myCall(function () {
  this.a = 1
}, a)
console.log('call', a)


a = {}
myApply(function () {
  this.a = 1
}, a, [1, 2, 3])
console.log('apply', a)

a = {}
myBind(function () {
  this.a = 1
}, a, [1, 2, 3])()
console.log('bind', a)

// Object.create(proto) 创建一个对象，其__proto__指向传入的原型

function myCreate(proto) {
  let res = {}
  res.__proto__ = proto
  return res
}
console.log('create', myCreate(new A()).a)

function deepCopy(target) {
  let obj
  // 是否是数组
  if (Array.isArray(target)) {
    obj = []
    for (let i = 0; i < target.length; i++) {
      obj[i] = deepCopy(target[i])
    }
  } else if (target instanceof Object) {// 是否是对象
    // 空对象直接赋值
    obj = {}
    for (let key in target) {
      obj[key] = deepCopy(target[key])
    }
  } else {
    obj = target
  }
  return obj
}

let target = {
  arr: [1, 2, {
    arr: [1, {}]
  }],
  o: {
    o_arr: [1, 2, 3]
  },
  num: 1,
  str: 'asd'
}
console.log('deepcopy', deepCopy(target))