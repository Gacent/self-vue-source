# vue 与 模板

# 数据驱动模型
利用提供的数据，和页面中模板生成一个新的HTML标签，替换到页面中放置模板的位置

# 简单的模板渲染

# 虚拟DOM
1. 将真正的DOM转化成虚拟DOM
2. 将虚拟DOM转化为真正的DOM
思路和深拷贝类似

# 函数柯里化
概念：
1. 柯里化：一个函数原本有多个参数，只传入**一个**参数，生成一个新函数，由新函数接收剩下的参数来运行得到的结构
2. 偏函数：一个函数原本有多个参数，只传入**一部分**参数，生成一个新函数，由新函数接收剩下的参数来运行得到的结构
3. 高阶函数：一个函数**参数是一个函数**，该函数对参数函数进行加工，得到一个函数，这个加工的函数就是高阶函数

为什么使用柯里化：
为了提高性能，使用柯里化可以缓存一部分能力

两个案例：
1. 判断元素
vue 本质上是使用HTML的字符串作为模板，将字符串中的模板转化成AST，再转化为虚拟DOM
- 模板->AST
- AST->vnode
- vnode->真实DOM

* 哪个阶段最消耗性能？
字符串解析（模板->AST）
例子：let s="1+2*(3+4)"，写一个程序，解析这个表达式，得出结果
答：“波兰式”表达式，使用栈结构进行计算

* vue中每一个标签可以是HTML标签，也可以是组件，怎么区分的？
把所有HTML标签存到数组中，**isHTMLTag**
```js
let tags='div,p,a,img,ul,li'.split(',')
function isHTMLTag( tagName ) {
  tagName = tagName.toLowerCase();
  if ( tags.indexOf( tagName ) > -1 ) return true;
  return false;
}
```
模板是任意编写的, 可以写的很简单, 也可以写到很复杂, indexOf 内部也是要循环的
如果有 6 中内置标签, 而模板中有 10 个标签需要判断, 那么就需要执行 60 次循环

2. 虚拟DOM的render方法
* 模板转换成AST需要执行多少次
- 页面一开始加载渲染
- 每个属性（响应式）数据发生变化时候，需要渲染
- watch,computed等

render的作用是将虚拟DOM转化为真正的DOM加到页面中
- 虚拟DOM可以降级为AST
- 一个项目运行的时候，模板是不会变的，就标识AST是不会变化的
所有优化：将虚拟DOM缓存起来，生成一个函数，函数只需要传入数据，就可以得到真正的DOM

# 响应式原理
- 设置属性的时候，页面数据更新
- 使用Object.defineProperty
  ```js
  Object.defineProperty(对象,'设置什么属性名',{
    value
    writeable
    configable
    enumerable// 控制属性是否可枚举，for循环可否取出来
    set(){}
    get(){}
  })
  // 如果有属性writeable和value，则表示数据描述符，并且不能和get和set方法并存
  // 如果有get和set方法，则表示存取描述符，并且不能和writeable和value并存
  ```
  存在的问题: 需要一个全局变量去存储改变的值，并且暴露全局中。
- vue中使用defineReactive(target,key,value,enumerable)
- 对于对象可以使用递归的方式，但是数组我们需要处理
  * push
  * pop
  * sort
  * reserve
  * shift
  * unshift
  * splice
  1. 在改变数组数据的时候，发出通知
    - vue2中的缺陷，数组发生变化，不会监听，vue3中使用proxy语法解决了
  2. 加入的元素应该变成响应式的
  3. 技巧：如果一个函数已经定义，但需要扩展其功能
    - 使用一个临时的函数名存储
    - 重新定义原来的函数
    - 定义扩展的功能
    - 调用临时的函数
  4. 扩展数组的push和pop
    - 直接修改propertype**不行**
    - 修改要进行响应化的数组的原型（__proto__）
# 发布订阅模式
- 代理方法（app.name）
- 事件模型（node:event模块）
- vue 中Observer与Watcher和Dep

目的：解耦，让各个模块之间没有紧密的联系
属性在更新的时候，调用mountComponent
mountComponent更新的是什么？？全部页面-》当前虚拟DOM的页面DOM
在Vue中，整个页面按组件为单位，以节点为单位进行更新
- 如果页面没有自定义组件，在diff算法的时候，会将全部模板对应的虚拟DOM进行比较
- 如果页面有自定义组件，在diff算法的时候，会判断是哪些组件的属性更新，其他组件不会更新
复杂的页面有很多组件组成，每个属性更新都要调用更新方法？
**目标是修改什么属性，就尽可能只更新这些属性对应的页面DOM**

例子：预售商品，预约，有货，老板通知俺
老板是发布者
订阅什么东西作为中间媒介
我是订阅者

代码结构解释：
1. 老板提供一个账簿（数组）
2. 我订阅我的商品（老板记录下谁定了什么东西，在数组中存储某些东西）
3. 等待，不影响我做其他事情
4. 货品来了，老板查看账簿，挨个打电话（遍历数组，取出数组来使用）

实际就是事件模型
1. event全局对象
2. event.on('事件名'，处理函数)，订阅事件，且可以连续订阅
3. event.off()
  - 移除所有
  - 移除某个类型的所有事件
  - 移除某个类型的某一处理函数
4. event.emit('事件名'，参数)，先前注册的事件处理函数会依次调用

## 发布订阅模式
中间的**全局的容器**, 用来**存储**可以被触发的东西( 函数, 对象 )
需要一个方法, 可以往容器中**传入**东西 ( 函数, 对象 )
需要一个方法, 可以将容器中的东西取出来**使用**( 函数调用, 对象的方法调用 )

## Vue模型
页面中的变更（diff）是以组件为单位
- 如果页面中只有一个组件（vue实例），不会有性能消耗
- 如果页面中有多个组件（多watcher的一个情况），第一次会有多个组件watcher存入到全局的watcher中
  - 如果修改了局部数据（例如其中一个组件的数据）
  - 只会对该组件进行diff算法，也就会重新生成该组件的AST
  - 只会访问该组件的watcher
  - 也就表示再次往全局存储的只有该组件的watcher
  - 页面更新的时候，只用更新一部分
- 页面一开始渲染的时候，是会将组件watcher先存进全局watcher并一一执行，后面修改局部数据的时候，会将对应的组件的watcher存进watcher并一一执行，而不是全部组件watcher都执行
  - **读取**：将watcher存入全局容器时，被称为**依赖收集**
  - **修改**：将全局中的watcher一一取出执行，被称为**派发更新**

## 改写Observe
缺陷：
- 无法处理数组
- 响应式无法在中间集成Watcher处理
- 我们实现reactify需要和实例紧紧的关联，需要解耦

vue2.x中，数组的监听缺陷：
例如：
```js
let arr=[{name:1},213]
// 经过observe之后，arr[0].name是响应式的，但是arr[0],arr[1]都不是响应式的，所以我们在arr[0]={xxx}的时候，就会出现问题
```

## 改写Watcher
两步：
1. 只考虑修改后刷新（响应式）
2. 再考虑依赖收集（优化）

在vue中，提供一个构造函数watcher
Watcher的一些方法：
- get()：进行计算或执行处理函数
- update()：公用的外部方法，触发内部run方法
- run()：用来判断内部是使用异步运行还是同步运行，最终会调用get方法
- cleanupDep()：简单理解为清除队列

哪个方法是执行页面渲染的？？
get方法

## 改写Dep
该对象提供 依赖收集 ( depend ) 的功能, 和 派发更新 ( notify ) 的功能
在 notify 中去调用 watcher 的 update 方法

## Watcher和Dep
之前将渲染Watcher放在全局作用域下，这样处理有问题
- vue项目中包含很多组件，各个组件都是**自治**的
  - 那么Watcher就有多个
  - 每个Watcher用于描述一个渲染行为或计算行为
    - 子组件发生数据的更新，页面需要重新渲染（vue中是**局部**渲染）
    - 如 vue中推荐使用 计算属性 代替 插值表达式
      - `name () => this.firstName + this.lastName`
        - 计算属性依赖于后两个属性
        - 只要依赖的属性发生变化，那么就会触发计算属性**重新计算**（Watcher）
- 依赖收集与派发更新是怎么运行起来的

- 属性和当前Watcher关联起来？
  - 全局中准备一个targetStack（watcher栈）
  - 在watcher调用get方法的时候，将当前Watcher放到全局，在get之前结束的时候，将这个全局的watcher清空，pushTarget，popTarget
  - 每个属性中有一个Dep对象
  - 我们在访问对象属性的时候（get），我们的渲染watcher就在全局中，将属性与watcher关联，其实就是将当前渲染的watcher存储到属性相关的dep中，同时，将Dep也存储到当前全局的watcher中（互相引用的关系）
    - father{son}
    - son{father}
  - 我们dep有一个方法，notify()，内部就是将Dep中的subs取出来，一次调用其update方法
    - subs中存储的是 知道要渲染什么的 watcher
- 个人理解
  - 渲染过程： 渲染mount->执行mountComponent->创建watcher并先执行一次get方法
    ->pushTarget（this是watcher）-> 执行watcher传进来的mount方法 （即渲染数据）
    -> for（
      ->combine（AST+data）过程中会读取到data里面的属性，会执行defineReactive（此时的defineReactive里面是执行过initData的，所以每个data属性都会有对应的一个dep）
      -> dep.depend依赖收集，先将watcher存进当前dep的subs里，再将当前dep对象存进watcher的deps里，相互引用
    ） 
    -> popTarget（将当前watcher出栈，表示当前组件渲染完成）
  - 数据变化过程：先看一下这个属性是否做了依赖收集（即Dep内是否有对应的watcher），如果没有，则不会执行页面更新，否则，会执行watcher的update方法
  - Dep.target 即 运行时watcher，只有运行执行时候才会有，所以难以调试
