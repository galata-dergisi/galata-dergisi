package main

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"

	handlers "galatadergisi.org/server/http-handlers"
	"github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

var DB_NAME string
var DB_USER string
var DB_PASS string
var DB_HOST string
var DB_PORT string
var db *sql.DB

func ReadEnv() {
	envs, err := godotenv.Read(".env")

	if err != nil {
		log.Fatalf("error loading .env file: %v\n", err)
	}

	variables := map[string]string{
		"GALATA_DB_NAME": "",
		"GALATA_DB_USER": "",
		"GALATA_DB_PASS": "",
		"GALATA_DB_HOST": "",
		"GALATA_DB_PORT": "",
	}

	for key, _ := range variables {
		envVar, isSet := os.LookupEnv(key)

		if isSet {
			variables[key] = envVar
		} else if dotEnvVar, exists := envs[key]; exists {
			variables[key] = dotEnvVar
		} else {
			log.Fatalf("%s is not set!\n", key)
		}
	}

	DB_NAME = variables["GALATA_DB_NAME"]
	DB_USER = variables["GALATA_DB_USER"]
	DB_PASS = variables["GALATA_DB_PASS"]
	DB_HOST = variables["GALATA_DB_HOST"]
	DB_PORT = variables["GALATA_DB_PORT"]
}

func ConnectToDatabase() {
	// Capture connection properties.
	cfg := mysql.Config{
		User:   DB_USER,
		Passwd: DB_PASS,
		Net:    "tcp",
		Addr:   fmt.Sprintf("%s:%s", DB_HOST, DB_PORT),
		DBName: DB_NAME,
	}

	// Get a database handle.
	var err error
	db, err = sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		log.Fatal(err)
	}

	pingErr := db.Ping()
	if pingErr != nil {
		log.Fatal(pingErr)
	}

	log.Println("connected to database")
}

func StartServer() {
	mux := http.NewServeMux()

	mh := handlers.MagazinesHandler{DB: db}

	mux.Handle("/magazines", mh)
	mux.Handle("/magazines/", mh)
	mux.Handle("/", http.FileServer(http.Dir("../public")))

	err := http.ListenAndServe(":3000", mux)
	if errors.Is(err, http.ErrServerClosed) {
		fmt.Printf("server closed\n")
	} else if err != nil {
		fmt.Printf("error starting server: %s\n", err)
		os.Exit(1)
	}
}

func main() {
	ReadEnv()
	ConnectToDatabase()
	StartServer()
}
