SVue.prototype.mount = function(){
  // 提供一个render方法：生成虚拟DOM
  this.render=this.createRenderFn()
  this.mountComponent()
}
SVue.prototype.mountComponent=function(){
  let mount=()=>{
    this.update(this.render())
  }
  // mount.call(this) // 本质上要交给watcher调用
  // 这个 Watcher 就是全局的 Watcher, 在任何一个位置都可以访问他了 ( 简化的写法 )
  new Watcher( this, mount ); // 相当于这里调用了 mount
}
SVue.prototype.createRenderFn=function(){
  let ast=getVNode(this._template)  // 旧的VNode
  // Vue:AST+data=>Vnode
  // 我们:带坑的VNOde+data=>含有数据的新的VNode
  return function render(){
    let tmp= combine(ast,this._data)
    return tmp
  }
}
SVue.prototype.update=function(vnode){
  // 父元素.replaceChild(新元素，旧元素)
  let realDOM=parseVNode(vnode)
  this._parent.replaceChild(realDOM,document.querySelector('#root'))
}