package handlers

type Magazine struct {
	ID              int    `json:"id"`
	PublishDateText string `json:"publishDateText"`
	ThumbnailURL    string `json:"thumbnailURL"`
	TableOfContents int    `json:"tableOfContents"`
	Visible         bool   `json:"visible"`
	PublishDate     string `json:"publishDate"`
}

type Page struct {
	ID                      int    `json:"id"`
	MagazineIndex           int    `json:"magazineIndex"`
	PageNumber              int    `json:"pageNumber"`
	Content                 string `json:"content"`
	AlternativeContent      string `json:"alternativeContent"`
	AlternativeContentUntil string `json:"alternativeContentUntil"`
}
