var PENDING = 'pending'
var FULFILLED = 'fulfilled'
var REJECTED = 'rejected'

function MyPromise(fn) {
    this.status = PENDING
    this.value = null;
    this.reason = null;
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    var that = this
    function resolve(value) {
        that.status = FULFILLED
        that.value = value

        that.onFulfilledCallbacks.forEach(callback => callback(that.value))
    }
    function reject(reason) {
        that.status = REJECTED
        that.reason = reason

        that.onRejectedCallbacks.forEach(callback => callback(that.reason))
    }

    try {
        fn(resolve, reject); // console.log('execute fn')
    } catch (e) {
        reject(e)
    }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
    var realOnFulfilled = onFulfilled
    // onFulfilled, onRejected 不是函数
    if (typeof realOnFulfilled != 'function') {
        realOnFulfilled = function (value) {
            return value
        }
    }
    // onRejected 同理
    var realOnRejected = onRejected
    if (typeof realOnRejected != 'function') {
        realOnRejected = function (reason) {
            return reason
        }
    }

    var that = this
    // onFulfilled, onRejected 都是函数
    if (this.status == FULFILLED) {
        var promise2 = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                try {
                    if (typeof onFulfilled != 'function') {
                        resolve(that.value)
                    } else {
                        var x = realOnFulfilled(that.value)
                        resolvePromise(promise2, x, resolve, reject)
                    }
                } catch (e) {
                    reject(e)
                }
            })
        })
        return promise2
    }
    if (this.status == REJECTED) {
        var promise2 = new MyPromise((resolve, reject) => {
            setTimeout(() => {
                try {
                    if (typeof onRejected != 'function') {
                        reject(that.reason)
                    } else {
                        var x = realOnRejected(that.reason)
                        resolvePromise(promise2, x, resolve, reject)
                    }
                } catch (e) {
                    reject(e)
                }
            })
        })
        return promise2
    }
    if (this.status == PENDING) {
        var promise2 = new MyPromise((resolve, reject) => {
            this.onFulfilledCallbacks.push(() => {
                setTimeout(() => {
                    try {
                        if (typeof onFulfilled != 'function') {
                            resolve(that.value)
                        } else {
                            var x = realOnFulfilled(that.value)
                            resolvePromise(promise2, x, resolve, reject)
                        }
                    } catch (e) {
                        reject(e)
                    }
                })
            }); // console.log('add then()')
            this.onRejectedCallbacks.push(() => {
                setTimeout(() => {
                    try {
                        if (typeof onRejected != 'function') {
                            reject(that.reason)
                        } else {
                            var x = realOnRejected(that.reason)
                            resolvePromise(promise2, x, resolve, reject)
                        }
                    } catch (e) {
                        reject(e)
                    }
                })
            })
        })
        return promise2
    }
}

function resolvePromise(promise, x, resolve, reject) {
    if (promise === x) {
        throw TypeError('promise should not equal to x')
    }

    if (x instanceof MyPromise) {
        x.then(y => resolvePromise(promise, y, resolve, reject), reject)
    } else if (typeof x === 'object' || typeof x === 'function') {
        if (x === null) resolve(x)

        try {
            var then = x.then
        } catch (e) {
            return reject(e)
        }

        if (typeof then === 'function') {
            var called = false
            try {
                then.call(
                    x,
                    function(y) {
                        if (called) return
                        called = true
                        resolvePromise(promise, y, resolve, reject)
                    },
                    function(r) {
                        if (called) return
                        called = true
                        reject(r)
                    }
                )
            } catch (e) {
                if (called) return
                reject(e)
            }
        } else {
            resolve(x)
        }
    } else {
        resolve(x)
    }
}
MyPromise.deferred = function () {
    var result = {};
    result.promise = new MyPromise(function (resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
    });

    return result;
}

module.exports = MyPromise