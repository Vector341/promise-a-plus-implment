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

    // onFulfilled, onRejected 都是函数
    if (this.status == FULFILLED) {
        onFulfilled(this.value)
    }
    if (this.status == REJECTED) {
        onRejected(this.reason)
    }
    if (this.status == PENDING) {
        this.onFulfilledCallbacks.push(realOnFulfilled); // console.log('add then()')
        this.onRejectedCallbacks.push(realOnRejected)
    }
}

module.exports = MyPromise