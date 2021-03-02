let watcherId=0
// 观察者，用于发射更新行为
class Watcher{
  /**
   * 
   * @param {Object} vm JGVue 实例
   * @param {String|Function} expOrfn 如果是渲染watcher，传入的就是渲染函数，如果是计算Watcher传入的就是路径表达式，暂时考虑为函数情况
   */
  constructor(vm,expOrfn){
    this.vm=vm
    this.getter=expOrfn;
    this.id=watcherId++
    this.deps=[]  // 依赖项
    this.depIds={}  // Set类型，保证依赖性的唯一性
    // 一开始需要渲染: 真实 vue 中: this.lazy ? undefined : this.get()
    this.get();
  }

  get(){
    pushTarget(this)
    this.getter.call(this.vm,this.vm) // 解决上下文问题
    popTarget()
  }
  /**
   * 执行, 并判断是懒加载, 还是同步执行, 还是异步执行: 
   * 我们现在只考虑 异步执行 ( 简化的是 同步执行 )
   */
  run() {
    this.get(); 
    // 在真正的 vue 中是调用 queueWatcher, 来触发 nextTick 进行异步的执行
  }

  /** 对外公开的函数, 用于在 属性发生变化时触发的接口 */
  update() {
    this.run(); 
  }

  /** 清空依赖队列 */
  cleanupDep() {

  }
  // 将当前的dep与当前的watcher关联
  addDep(dep){
    this.deps.push(dep)
  }
}