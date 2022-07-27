### 1、git pull 和git fetch
git fetch只会拉取远程分支，不会合并到本地分支

### 合并多次提交
- git reset –soft HEAD~N &&
git commit
- git reset –soft HEAD~N &&
git commit  –edit -m"$(git log –format=%B –reverse .HEAD@{N})" 可以提取其中的commit消息

### 分支的合并信息
- 查看合并了的分支 git branch –merged
- 查看未合并的分支 git branch –no-merged 

### 修改commit信息
git commit --amend 修改本地分支，远程分支push时需要覆盖

### rebase（变基）和merge
和merge不同，rebase会根据提交时间创建新的commit，而不是按本地commit的时间合并

不过也有缺点，举个例子：
- 分支a在经过一次rebase后的分支source中拉去并进行了开发
- source分支的rebase被回滚

https://www.zhihu.com/question/36509119


