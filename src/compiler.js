// 生成带坑的VNode，当作compiler函数
function getVNode(node) {
  let nodeType=node.nodeType
  let _vnode=null
  if(nodeType===1){
    //  元素节点
    let nodeName=node.nodeName
    let attrs=node.attributes
    let _attrObj={}
    for(let i=0;i<attrs.length;i++){
      // attrs[i] 属性节点 nodeType===2
      _attrObj[attrs[i].nodeName]=attrs[i].nodeValue
    }
    
    _vnode=new VNode(nodeName,_attrObj,undefined,nodeType)
    // 考虑子元素
    let childNodes=node.childNodes
    for(let i=0;i<childNodes.length;i++){
      _vnode.appendChild(getVNode(childNodes[i])) // 递归
    }
  } else if(nodeType===3){
    //  文本节点
    _vnode=new VNode(undefined,undefined,node.nodeValue,nodeType)
  }
  return _vnode
}
//  创建真实DOM
function parseVNode(vnode){
  let type=vnode.type
  let _node=null
  if(type===3){
    return document.createTextNode(vnode.value)
  } else if(type===1){
    _node=document.createElement(vnode.tag)
    // 属性
    let data=vnode.data
    Object.keys(data).forEach((key)=>{
      let attrName=key
      let attrValue=data[key]
      _node.setAttribute(attrName,attrValue)
    })
    // 子元素
    let childNodes=vnode.children
    for(let i=0;i<childNodes.length;i++){
      _node.appendChild(parseVNode(childNodes[i]))
    }
  }
  return _node
}
// 值路径
function getValueByPath(obj,path){
  let paths=path.split('.')
  let res=obj
  let prop
  while(prop=paths.shift()){
    res=res[prop]
  }
  return res
}
let rkuohao=/\{\{(.+?)\}\}/g
// 生成填充数据之后的Vnode，模拟AST -> Vnode
function combine(vnode,data){
  let {data:_data,tag:_tag,value:_value,type:_type,children:_children}=vnode
  let _vnode=null
  if(_type===1){
    _vnode=new VNode(_tag,_data,_value,_type)
    _children.forEach(_subvnode => {
      _vnode.appendChild(combine(_subvnode,data))
    });
  } else if(_type===3){
    _value=_value.replace(rkuohao,function(_,g){
      return getValueByPath(data,g.trim())
    })
    _vnode=new VNode(_tag,_data,_value,_type)
  }
  return _vnode
}