package images

import "embed"

//嵌入为一个文件系统 新的文件系统FS
//go:embed images*
var FS embed.FS
