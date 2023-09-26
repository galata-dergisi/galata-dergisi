package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestNonGetMethods(t *testing.T) {
	methods := []string{
		http.MethodPost,
		http.MethodDelete,
		http.MethodPut,
		http.MethodPatch,
	}

	for _, method := range methods {
		request := httptest.NewRequest(method, "/magazines", nil)
		responseRecorder := httptest.NewRecorder()

		mh := MagazinesHandler{}
		mh.ServeHTTP(responseRecorder, request)

		want := http.StatusMethodNotAllowed
		got := responseRecorder.Code

		if want != got {
			t.Errorf("want status %d, got status %d", want, got)
		}
	}
}

func TestGetAllMagazines(t *testing.T) {
	paths := []string{"/magazines", "/magazines/"}

	for _, path := range paths {
		request := httptest.NewRequest(http.MethodGet, path, nil)
		responseRecorder := httptest.NewRecorder()

		mh := MagazinesHandler{}
		mh.ServeHTTP(responseRecorder, request)

		want := http.StatusOK
		got := responseRecorder.Code

		if want != got {
			t.Errorf("want status %d, got status %d", want, got)
		}

		var magazines []Magazine

		err := json.NewDecoder(responseRecorder.Body).Decode(&magazines)

		if err != nil {
			t.Error(err)
		}
	}
}

func TestGetPages(t *testing.T) {
	paths := []string{"/magazines/1/pages", "/magazines/1/pages/"}

	for _, path := range paths {
		request := httptest.NewRequest(http.MethodGet, path, nil)
		responseRecorder := httptest.NewRecorder()

		mh := MagazinesHandler{}
		mh.ServeHTTP(responseRecorder, request)

		want := http.StatusOK
		got := responseRecorder.Code

		if want != got {
			t.Errorf("want status %d, got status %d", want, got)
		}

		var pages []Page

		err := json.NewDecoder(responseRecorder.Body).Decode(&pages)

		if err != nil {
			t.Error(err)
		}
	}
}

func TestGetMagazines(t *testing.T) {
	getMagazines()

}
