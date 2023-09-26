package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"regexp"
)

var reMagazines = regexp.MustCompile("^/magazines/?$")
var rePages = regexp.MustCompile("^/magazines/(\\d+)/pages/?$")

type MagazinesHandler struct {
	DB *sql.DB
}

func isMagazinesRoute(path string) bool {
	return reMagazines.MatchString(path)
}

func isMagazinePagesRoute(path string) bool {
	return rePages.MatchString(path)
}

func getMagazines(db *sql.DB) ([]Magazine, error) {
	var magazines []Magazine

	rows, err := db.Query("SELECT * FROM magazines WHERE visible = 1 AND publishDate < CURRENT_TIMESTAMP();")

	if err != nil {
		return nil, fmt.Errorf("getMagazines failed: %v", err)
	}

	defer rows.Close()

	// Loop through rows, using Scan to assign column data to struct fields.
	for rows.Next() {
		var magazine Magazine
		var publishDate []uint8

		err := rows.Scan(
			&magazine.ID,
			&magazine.PublishDateText,
			&magazine.ThumbnailURL,
			&magazine.TableOfContents,
			&magazine.Visible,
			&publishDate)

		if err != nil {
			return nil, fmt.Errorf("getMagazines failed: %v", err)
		}

		magazine.PublishDate = string(publishDate)
		magazines = append(magazines, magazine)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("getMagazines failed: %v", err)
	}

	return magazines, nil
}

func (mh MagazinesHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	if isMagazinesRoute(r.URL.Path) {
		w.Header().Set("Content-Type", "application/json")

		magazines, err := getMagazines(mh.DB)
		if err != nil {
			log.Printf("error serving /magazines: %v\n", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(magazines)
		return
	}

	if rePages.MatchString(r.URL.Path) {
		// parts := rePages.FindStringSubmatch(r.URL.Path)
		// magazineId := parts[1]
		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, "[]")
		return
	}

	http.Error(w, "Mehmet Baker", http.StatusBadRequest)
	return
}
