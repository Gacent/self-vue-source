// ----------------------------------------------
let ARRAY_METHODS=[
  'push',
  'pop',
  'sort',
  'shift',
  'unshift',
  'reverse',
  'splice'
]
let array_methods=Object.create(Array.prototype)
ARRAY_METHODS.forEach((method)=>{
  array_methods[method]=function(){
    console.log('调用拦截的方法'+method)
    // 将数据进行响应式化
    observe(arguments)

    let res=Array.prototype[method].apply(this,arguments)
    return res
  }
})
function defineReactive(target,key,value,enumerable){
  let that=this
  if(typeof value === 'object'&&value!=null){
    // 非数组的引用类型
    observe(value)
  }
  let dep= new Dep()
  dep.__propName__=key
  // console.log(dep) // 每个属性都会创建一个dep，但是不一定都会进行依赖收集
  // 利用value作为中间变量
  Object.defineProperty(target,key,{
    configurable:true,
    enumerable:!!enumerable,
    set(newVal){
      console.log('设置成'+newVal)
      // 非空的对象类型
      if(typeof newVal === 'object'&&newVal!=null) observe(newVal)
      value=newVal
      // 更新DOM，折中的方式
      // that.mountComponent()
      // 派发更新, 找到全局的 watcher, 调用 update
      dep.notify();
    },
    get(){
      console.log('get '+key)
      dep.depend()
      return value
    }
  })
}
// 将对象变为响应式
function observe(o,vm){
  if(Array.isArray(o)){
    // 数组
    o.__proto__=array_methods
    for(let i=0;i<o.length;i++){
      observe(o[i])
    }
  } else {
    let keys=Object.keys(o)
    for(let i=0;i<keys.length;i++){
      let prop=keys[i]
      defineReactive.call(vm,o,prop,o[prop],true)
    }
  }
}

function proxy(target,prop,key){
  Object.defineProperty(target,key,{
    enumerable:true,
    configurable:true,
    get(){
      console.log('proxy get ',key)
      return target[prop][key]
    },
    set(newVal){
      console.log('proxy set ',key)
      target[prop][key]=newVal
    }
  })
}


SVue.prototype.initData=function(){
  // 响应式化
  observe(this._data)
  // 代理,this._data[keys[i]]映射到this.keys[i]
  let keys=Object.keys(this._data)
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    proxy(this,'_data',key)
  }
}