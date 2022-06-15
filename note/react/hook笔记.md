# hook笔记

### useCallback
用于缓存函数，。通过检查deps是否变化来决定是否重新创建函数
需要确认，是否真的带来了性能提升，因为usecallback的判断也损耗性能。
#### 好的用例
```javascript
import useSearch from './fetch-items';
function MyBigList({ term, onItemClick }) {
  const items = useSearch(term);
  const map = item => <div onClick={onItemClick}>{item}</div>;
  return <div>{items.map(map)}</div>;
}
export default React.memo(MyBigList);
```

### 闭包问题
比如hook实现一个每秒自动加1的功能，如果这么写

```javascript

function App() {
  const [val, setVal] = useState(0)

  useEffect(() => {
    let id = setInterval(() => {
      setVal(val+1)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div id="App" className="App">
        {val}
    </div>
  );
}
```
由于useEffect只在初始化时执行，闭包中的val一直是0，导致执行结果一直是1

对于闭包问题，可以通过ref的方式解决

```javascript

function App() {
  const [val, setVal] = useState(0)
  const ref = useRef()

  useEffect(() => {
    ref.current = val
  })
  useEffect(() => {
    let id = setInterval(() => {
      // 或者setVal(v => v+1) 函数式会取最新的值
      setVal(ref.current+1)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div id="App" className="App">
        {val}
    </div>
  );
}
```

对ref的这个方法，其实可以抽出来，实现一个useLatest方法，用来存放最新的值

```javascript

// 其实就是val存放到ref.current
function useLatest(val) {
  const ref = useRef()
  ref.current = val
  
  return ref
}


function App() {
  const [val, setVal] = useState(0)
  // 每次val改变都会导致函数执行，刷新ref
  const ref = useLatest(val)

  useEffect(() => {
    let id = setInterval(() => {
      // 或者setVal(v => v+1) 函数式会取最新的值
      setVal(ref.current+1)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div id="App" className="App">
        {val}
    </div>
  );
}
```

不过这样还是不够直观，前面的方法ref都是存val，闭包里通过ref.current取值，还是不太直观，**如果能让setInterval执行一个会更新的函数**，那外层的代码不就不用变化吗

思路其实已经很清晰了，将函数存放在ref，setInterval里执行ref.current()就是新的hook -- `useInterval` 了

```javascript

function useLatest(val) {
  const ref = useRef()
  ref.current = val
  
  return ref
}

function useInterval(callback, delay){
  const ref = useLatest(callback)

  useEffect(() => {
    let id = setInterval(() => {
      // 执行最新的函数而不用清除定时器
      ref.current()
    }, delay);
    return () => clearInterval(id)
  }, [delay])
}

function App() {
  const [val, setVal] = useState(0)

  useInterval(() => {
    setVal(val+1)
  }, 1000)

  return (
    <div id="App" className="App">
        {val}
    </div>
  );
}
```

类似的，比如**addEventListener、setTimeout**等涉及闭包的问题，都可以采用上述的思路解决，**将变化藏在ref中解决，向外可以通过返回ref、useMemo、useCallback的方式返回一个固定的引用**