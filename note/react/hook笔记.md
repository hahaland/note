# hook笔记

## 小点
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
