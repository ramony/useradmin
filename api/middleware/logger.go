package middleware

import (
	"bytes"
	"io/ioutil"
	"github.com/gin-gonic/gin"
	"useradmin/api/config"
	"useradmin/api/models"
)

type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 读取请求体
		var bodyBytes []byte
		if c.Request.Body != nil {
			bodyBytes, _ = ioutil.ReadAll(c.Request.Body)
		}
		// 恢复请求体
		c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))

		// 包装响应写入器
		blw := &bodyLogWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = blw

		// 处理请求
		c.Next()

		// 获取用户名
		username := c.GetString("username")
		if username == "" {
			username = "anonymous"
		}

		// 创建日志记录
		log := models.Log{
			Username:  username,
			Action:    c.Request.Method,
			Resource:  c.Request.URL.Path,
			IP:        c.ClientIP(),
			UserAgent: c.Request.UserAgent(),
			Status:    c.Writer.Status(),
			Response:  blw.body.String(),
		}

		// 保存日志
		if err := config.DB.Create(&log).Error; err != nil {
			c.Error(err)
		}
	}
} 