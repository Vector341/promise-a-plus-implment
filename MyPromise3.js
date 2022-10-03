const isFunction = obj => typeof obj === "function"
const isObject = obj => Boolean((obj && typeof obj === "object"))
const isThenable = obj => (isFunction(obj) || isObject(obj)) && "then" in obj
const isPromise = obj => obj instanceof MyPromise

const PENDING = "pending";
const FULFILLED = "fulfiled";
const REJECTED = "rejected";

function MyPromise(fn) {
  this.state = PENDING;
  this.result = null;
  this.callbacks = [];

  const onFulfilled = (value) => {
    transition(this, FULFILLED, value)
  }
  const onRejected = (reason) => {
    transition(this, REJECTED, reason)
  }

  let called = false;
  const resolve = (value) => {
    if(called) return
    called = true;
    reslovePromise(this, value, onFulfilled, onRejected)
  }
  const reject = reason => {
    if(called) return
    called = true;
    onRejected(reason)
  }
  try {
    fn(resolve, reject)
  } catch(e) {
    reject(e);
  }
}


MyPromise.prototype.then = function(onFulfilled, onRejected) {
  return new MyPromise((resolve, reject) => {
    let callback = {onFulfilled, onRejected, resolve, reject};
    if(this.state === PENDING) {
      this.callbacks.push(callback);
    } else {
      setTimeout(() => handleCallback(callback, this.state, this.result), 0);
    }
  })
}


const transition = (promise, state, result) => {
  if (promise.state != PENDING) return

  promise.state = state;
  promise.result = result;
  setTimeout(() => {
    promise.callbacks.forEach(callback => {
      handleCallback(callback, state, result);
    });
  }, 0)
}

const handleCallback = (callback, state, result) => {
  let {onFulfilled, onRejected, resolve, reject} = callback;
  try {
    if(state === FULFILLED) {
      if(isFunction(onFulfilled)) {
        let ret = onFulfilled(result);
        resolve(ret);
      } else {
        resolve(result)
      }
    } else {
      isFunction(onRejected) ? resolve(onRejected(result)) : reject(result);
    }
  } catch(e) {
    reject(e);
  }
}

const reslovePromise = (promise, x, resolve, reject) => {
  if(x === promise) {
    return reject(new TypeError("x === promise"))
  }
  if(isPromise(x)) {
    return x.then(resolve, reject)
  }
  if(isThenable(x)) {
    try {
      let then = x.then;
      if(isFunction(then)) {
        return new MyPromise(then.bind(x)).then(resolve,  reject)
      }
    } catch(e) {
      reject(e) 
    }
  }

  resolve(x);
}

module.exports = MyPromise