// 实现 ES6 Promise的其他API
var MyPromise = require('./MyPromise2')

// Promise.resolve
MyPromise.resolve = function(x) {
  if(x instanceof MyPromise) {
    return x;
  } else {
    return new MyPromise((resolve) => {
      resolve(x);
    })
  }
}

// Promise.reject
MyPromise.reject = function(x) {
  return new MyPromise((resolve, reject) => {
    reject(x);
  })
}

// Promise.all
MyPromise.all = function(promises) {
  return new MyPromise(function(resolve, reject) {
    var len = promises.length;
    var counter = 0;
    var ret = [];
    
    if(len === 0) resolve(ret); // 如果传入数组为空, 同步执行.

    for(let i=0; i<len; i++) {
      let p = promises[i];
      MyPromise.resolve(p).then(res => {
        ret[i] = res;
        counter++;
        if(counter === len) {
          resolve(ret);
        }
      }, err => {
        reject(err);
      })
    }
  })
}

// Promise.race
MyPromise.race = function(promises) {
  // 若 promises 为空数组, race 返回的 promise 永远 pending
  return new MyPromise(function(resolve, reject) {
    for(let p of promises) {
      MyPromise.resolve(p).then(res => {
        resolve(res);
      }, err => {
        reject(err);
      })
    }
  })
}

MyPromise.prototype.catch = function(onRejected) {
  this.then(null, onRejected);
}