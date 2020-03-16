function SuperType() {
  this.type = 'super'
  this.super = 'yes'
}

SuperType.prototype.getType = function () {
  return `getType ${this.type}`
}

function SubType(type) {
  SuperType.call(this)
  this.type = 'sub'
  this.sub = 'yes'
}



function bindPrototype(sub, prototype) {
  function objectProto(prototype) {
    let O = function () { }
    O.prototype = prototype
    return new O()
  }
  sub.prototype = objectProto(prototype)
  sub.prototype.constructor = sub
}
bindPrototype(SubType, SuperType.prototype)

SubType.prototype.getSub = function () {
  return this.sub
}

let o = new SubType()
console.log(o.getType(),'p super',o.super,'p sub',o.sub)
console.log(o.getType(),o.super,o.sub)
