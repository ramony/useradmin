package models

import (
	"gorm.io/gorm"
	"time"
)

type Log struct {
	gorm.Model
	Username  string    `json:"username"`
	Action    string    `json:"action"`
	Resource  string    `json:"resource"`
	IP        string    `json:"ip"`
	UserAgent string    `json:"user_agent"`
	Status    int       `json:"status"`
	Response  string    `json:"response"`
	CreatedAt time.Time `json:"created_at"`
} 