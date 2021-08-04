/*
  Object.create
*/
function object(o){
  function F() {}
  F.prototype = o
  return new F()
}


/*
  寄生组合式继承
*/
function Parent(){
}
function Child() {
  Parent.call(this)
}
Child.prototype = object(Parent.prototype)
Child.prototype.constructor = Child


/*
  Promise
*/

function MyPromise(fn){
  status = 'pending' // pending fulfilled rejected
  callback = []
  errCallback = []
  value = null
  reason = null


  // 链式调用存入callback队列
  function then(onFulfilled) {
    return new MyPromise(resolve => {
      this.handle({
        onFulfilled,
        resolve
      })
    })
  }
  function handle(callback) {
    if(this.status == 'pending'){
      this.callback.push(callback)
      return
    }

    if(!callback.onFulfilled){
      callback.resolve(this.value)
      return
    }
    callback.resolve(callback.onFulfilled(this.value))
  }
  function resolve(val){
    if(this.status === 'pending'){
      this.status = 'fulfilled'
      this.value = val
    }
    
  }

  function reject(err){
    if(this.status === 'pending'){
      this.status = 'rejected'
      this.reason = err
    }
  }
  function catch(err){
    this.callback.push(onFulfilled)
    return this
  }

  fn(resolve, reject)

}