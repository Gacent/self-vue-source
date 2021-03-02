function SVue(options){
  this._data=options.data
  let elm=document.querySelector(options.el) // 在vue中是字符串，这里是DOM（简化）
  this._template=elm;
  this._parent=elm.parentNode
  this.initData()

  // 挂载
  this.mount()
}