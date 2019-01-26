---
layout:		post
category:	"lua"
title:		"Lua的io及File"
tags:		[lua]
---
- Content
{:toc}

参考：[Lua 5\.3 参考手册](https://cloudwu.github.io/lua53doc/manual.html#pdf-io.type)

# 打开文件
io.open (filename [, mode])

功能：按指定的模式打开一个文件，成功则返回文件句柄，失败则返回nil+错误信息

## 文件打开模式
- "r": 读模式 (默认);
- "w": 写模式;
- "a": 添加模式;
- "r+": 更新模式，所有之前的数据将被保存
- "w+": 更新模式，所有之前的数据将被清除
- "a+": 添加更新模式，所有之前的数据将被保存,只允许在文件尾进行添加
- "b": 某些系统支持二进制方式

# 一次性读取文本文件的所有内容
```lua
file = io.open(star.getluapath()..'1.txt', 'r')
s = file:read('*a') --或者'*all'
io.close(file)
```

# 往文件中写入字符串文本
```lua
file = io.open("1.txt","w+") --'w'
file:write(s)
```

# 获取文件名与扩展名
```lua
--效果等同，第一种方法要比第二种方法快
_,_,ext = string.find(filename, '.*(%..*)')


--获取文件名中的后缀
--param filename file name
--return suffix file type with dot
function getsuffix(filename)
    filename = filename:gsub('?.-$','')
    local suffix = filename:match('([^.]-)$')
    return '.'..suffix
end
```

# 关闭文件
io.close ([file])，相当于file:close()，关闭文件。

# 输出所有缓冲中的内容到文件
io.flush()，相当于file:flush()。

# 逐行迭代读取
- io.lines ([filename])，打开指定的文件filename为读模式并返回一个迭代函数,每次调用将获得文件中的一行内容,当到文件尾时，将返回nil,并自动关闭文件。

若不带参数时io.lines() <=> io.input():lines(); 读取默认输入设备的内容，但结束时不关闭文件。
```lua
for line in io.lines("test.txt") do
	print(line)
end
```

- file:lines()

功能：返回一个迭代函数,每次调用将获得文件中的一行内容,当到文件尾时，将返回nil,但不关闭文件
```lua
for line in file:lines() do body end
```

# 获取临时文件句柄
**io.tmpfile()**
如果成功，返回一个临时文件的句柄。 这个文件以更新模式打开，在程序结束时会自动删除。

# 获取一个临时文件名
os.tmpname()

# 判断文件句柄
**io.type(obj)**
检查 obj 是否是合法的文件句柄。 如果 obj 它是一个打开的文件句柄，返回字符串 "file"。 如果 obj 是一个关闭的文件句柄，返回字符串 "closed file"。 如果 obj 不是文件句柄，返回 nil 。

# 设置输出文件的缓冲模式
file:setvbuf(mode,[,size])

参数

mode:
- "no": 没有缓冲，即直接输出
- "full": 全缓冲，即当缓冲满后才进行输出操作(也可调用flush马上输出)
- "line": 以行为单位，进行输出(多用于终端设备)

最后两种模式,size可以指定缓冲的大小(按字节)，忽略size将自动调整为最佳的大小

# 遍历文件
```lua
--使用lsf库

function findindir (dir)
	local oldname = nil
	local newname = nil

	for filename in lfs.dir(dir) do
		oldname = dir..filename
		_,_,filename,ext = string.find(filename, '(.*)(%..*)')
		if RENAME[filename]~=nil then
			newname = dir..RENAME[filename]..ext
			star.renamefile(oldname, newname)
			--print(newname)
		end
	end
end

------

function findindir (path, wefind, r_table, intofolder)
    for file in lfs.dir(path) do
        if file ~= "." and file ~= ".." then
            local f = path..'\\'..file
            print ("\t "..f)
            table.insert(r_table, f)

            local attr = lfs.attributes (f)
            assert (type(attr) == "table")
            if attr.mode == "directory" and intofolder then
                findindir (f, wefind, r_table, intofolder)
            else
                for name, value in pairs(attr) do
                    --print (name)
                end
            end
        end
    end
end

t = {}
findindir(ROOT,'',t,true)
```

过滤剔除非U3D引擎的游戏APK：
```lua
require'star'
require'zip'
require'lfs'

--[[http://math2.org/luasearch/zip.html]]
function findindir (path, wefind, r_table, intofolder)
    print(path)
    for file in lfs.dir(path) do
        if file ~= "."and file ~= ".." then
            local f = path..'\\'..file
            --print ("\t "..f)
            if string.find(f, wefind) ~= nil then
                --print("\t "..f)table.insert(r_table, f)
            end
            local attr = lfs.attributes (f)
            assert (type(attr) == "table")
            if attr.mode == "directory" and intofolder then
                findindir (f, wefind, r_table, intofolder)
            else
                for name, value in pairs(attr) do
                    print (name, value)
                end
            end
        end
    end
end

local currentFolder = star.getluapath()..'apks'
        local apks = {}
        local u3d = false
        findindir(currentFolder, ".apk", apks, true)
        --print(apks)for i inpairs(apks) do
        u3d = falseprint(apks[i])

        zfile = zip.open(apks[i])
        if zfile~=nil then
            for t in zfile:files() do
            --print(t.filename)
            if string.find(t.filename,'libmono.so') then
                u3d = true
                break
            end
        end

        zfile:close()

        if u3d==false then
            print('不是U3D引擎游戏，删除：'..apks[i])
            os.remove(apks[i])
        end
    end
end
```

# 删除文件
os.remove (filename)

功能：删除文件或一个空目录,若函数调用失败则返加nil加错误信息。

# 重命名（改名）
os.rename (oldname, newname)

功能：更改一个文件或目录名,若函数调用失败则返加nil加错误信息。
