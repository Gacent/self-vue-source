let depid=0
class Dep{
  constructor(){
    this.id=depid++
    this.subs=[]  // 存储的是与当前dep关联的Watcher
  }
  /** 添加一个 watcher */
  addSub( sub ) {
    this.subs.push(sub)
  }
  /** 移除 */
  removeSub( sub ) {
    for (let index = this.subs.length-1; index >=0 ; index--) {
      if(this.subs[index]===sub){
        this.subs.splice(index,1)
      }
    }
  }

  /** 将当前 Dep 与当前的 watcher ( 暂时渲染 watcher ) 关联*/
  depend() {
    // 将当前的dep与当前的watcher互相关联
    if(Dep.target){ // 一直都会是当前watcher对象
      this.addSub(Dep.target)
      Dep.target.addDep(this) // 将当前dep与当前的watcher关联起来
    }
  }
  /** 触发与之关联的 watcher 的 update 方法, 起到更新的作用 */
  notify() {
    // 在真实的 Vue 中是依次触发 this.subs 中的 dep中的 watcher 的 update 方法
    let deps=this.subs.slice()
    deps.forEach(watcher=>{
      watcher.update()
    })
  }
}
// 全局的容器存储渲染 Watcher
// let globalWatcher
// 学 Vue 的实现
Dep.target = null; // 这就是全局的 Watcher

let targetStack=[]

function pushTarget(target){
  targetStack.unshift(Dep.target)
  Dep.target=target
}

function popTarget(){
  Dep.target=targetStack.shift()
}