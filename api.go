package main

import (
	"compress/gzip"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"
)

var cacheDir string

const storyURLTemplate = "https://hacker-news.firebaseio.com/v0/item/%d.json"
const topURL = "https://hacker-news.firebaseio.com/v0/topstories.json"
const newURL = "https://hacker-news.firebaseio.com/v0/newstories.json"
const askURL = "https://hacker-news.firebaseio.com/v0/askstories.json"
const showURL = "https://hacker-news.firebaseio.com/v0/showstories.json"
const jobURL = "https://hacker-news.firebaseio.com/v0/jobstories.json"
const storyFilenameTemplate = "stories/%d.json"

var cache = &hnCache{
	jobs: []*story{},
	top:  []*story{},
	new:  []*story{},
	show: []*story{},
	ask:  []*story{},
}

type storyCacheFile struct {
	CacheTime time.Time `json:"cacheTime"`
	Story     *story    `json:"story"`
}

func itemHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json;charset=utf-8")
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	itemID, err := strconv.Atoi(parts[3])
	if err != nil || itemID < 1 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if searchItem(w, itemID, cache.top) {
		return
	}
	if searchItem(w, itemID, cache.new) {
		return
	}
	if searchItem(w, itemID, cache.show) {
		return
	}
	if searchItem(w, itemID, cache.ask) {
		return
	}
	if searchItem(w, itemID, cache.jobs) {
		return
	}
	log.Printf("Item %d not found\n", itemID)
	w.WriteHeader(http.StatusNotFound)
	return
}

func searchItem(w http.ResponseWriter, itemID int, stories []*story) bool {
	e := json.NewEncoder(w)
	for _, s := range stories {
		if s.ID == itemID {
			log.Printf("Item %d found...serving json\n", itemID)
			resp, err := http.Get(fmt.Sprintf("http://api.hackerwebapp.com/item/%d", itemID))
			if err != nil {
				log.Printf("ERR fetching comment details for %d: %v", itemID, err)
				w.WriteHeader(http.StatusInternalServerError)
				return true
			}
			defer resp.Body.Close()
			decoder := json.NewDecoder(resp.Body)
			var commentStory *story
			err = decoder.Decode(&commentStory)
			if err != nil || commentStory == nil {
				log.Printf("ERR decoding commentStory %d: %v", itemID, err)
				w.WriteHeader(http.StatusInternalServerError)
				return true
			}
			s.Comments = commentStory.Comments
			s.Domain = commentStory.Domain
			e.Encode(s)
			return true
		}
	}
	return false
}

func listHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json;charset=utf-8")
	e := json.NewEncoder(w)
	mode := strings.Split(r.URL.Path, "/")
	if len(mode) < 3 {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	log.Println("Serving:", mode[2], r.Header.Get("User-Agent"))
	switch mode[2] {
	case "top":
		e.Encode(paging(w, r, cache.top))
	case "jobs":
		e.Encode(paging(w, r, cache.jobs))
	case "new":
		e.Encode(paging(w, r, cache.new))
	case "show":
		e.Encode(paging(w, r, cache.show))
	case "ask":
		e.Encode(paging(w, r, cache.ask))
	default:
		w.WriteHeader(http.StatusNotFound)
	}
}

const resultsPerPage = 30

func paging(w http.ResponseWriter, r *http.Request, s []*story) []*story {
	p, err := strconv.Atoi(r.URL.Query().Get("p"))
	if err != nil || p < 1 {
		p = 1
	}
	if len(s) == 0 {
		w.Header().Set("X-Pages", "0")
		return s
	}
	availablePages := int(math.Ceil(float64(len(s) / resultsPerPage)))
	if len(s) > 0 && availablePages == 0 {
		availablePages = 1
	}
	w.Header().Set("X-Pages", strconv.Itoa(int(availablePages)))
	if p > availablePages {
		return []*story{}
	}
	offset := (p * 30) - 30
	var list []*story
	if len(s) < 30 {
		list = s
	} else {
		list = s[offset : offset+30]
	}
	no := offset + 1
	for _, st := range list {
		st.No = no
		no = no + 1
	}
	return list
}

func healthzHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("OK"))
}

func main() {
	flag.StringVar(&cacheDir, "cache-dir", "/var/hnapi", "Cache directory for HN data")
	flag.Parse()
	if cacheDir == "" {
		log.Fatal("Please provide a cache-dir value!")
		return
	}
	go func() {
		updateCache()
		t := time.NewTicker(time.Minute * 15)
		for {
			<-t.C
			updateCache()
		}
	}()
	http.Handle("/api/item/", gzipMiddleware(itemHandler))
	http.Handle("/api/", gzipMiddleware(listHandler))
	http.HandleFunc("/healthz", healthzHandler)
	log.Fatal(http.ListenAndServe(":8090", nil))
}

type gzipResponseWriter struct {
	io.Writer
	http.ResponseWriter
}

func (w gzipResponseWriter) Write(b []byte) (int, error) {
	return w.Writer.Write(b)
}

func gzipMiddleware(handler http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			handler(w, r)
			return
		}
		w.Header().Set("Content-Encoding", "gzip")
		gz := gzip.NewWriter(w)
		defer gz.Close()
		gzw := gzipResponseWriter{Writer: gz, ResponseWriter: w}
		handler(gzw, r)
	})
}

func updateCache() {
	log.Println("Start updating HN cache...")
	createCacheDir()
	cache.mu.Lock()
	defer cache.mu.Unlock()

	storyURLs := []string{topURL, newURL, askURL, showURL, jobURL}
	for _, url := range storyURLs {
		log.Printf("Start update for %s\n", url)
		ids, err := fetchStoryIDList(url)
		if err != nil {
			log.Printf("ERR: %v\n", err)
			continue
		}
		if len(ids) > 0 {
			log.Printf("First story in story list %s is %d\n", url, ids[0])
		}
		stories, err := getStoryDetails(ids)
		if err != nil {
			log.Printf("ERROR getting story details for %s: %v", url, err)
		}

		switch url {
		case topURL:
			cache.top = stories
		case newURL:
			cache.new = stories
		case askURL:
			cache.ask = stories
		case showURL:
			cache.show = stories
		case jobURL:
			cache.jobs = stories
		}
		log.Printf("Updated stories for %s", url)
	}
	log.Println("Finished update! :-)")
}

func getStoryDetails(ids []int64) ([]*story, error) {
	newList := struct {
		mu      sync.RWMutex
		stories []*story
	}{
		stories: make([]*story, len(ids)),
	}
	wg := sync.WaitGroup{}
	waitCount := 0
	for index, id := range ids {
		wg.Add(1)
		waitCount = waitCount + 1
		go func(id int64, index int) {
			upToDate, s, _ := storyCacheFileIsUpToDate(id)
			if upToDate {
				//log.Printf("Cache file for %d is up to date", id)
				newList.mu.Lock()
				newList.stories[index] = s
				newList.mu.Unlock()
				wg.Done()
				return
			}
			log.Printf("Story %d not update to date in cache. Fetching data from API...\n", id)
			story, err := fetchStory(id)
			if err != nil {
				log.Printf("ERR fetching %d: %v", id, err)
				wg.Done()
				return
			}
			newList.mu.Lock()
			newList.stories[index] = story
			newList.mu.Unlock()
			//log.Printf("Fetched story %d...updating file cache...\n", id)
			updateStoryFileCache(story)
			wg.Done()
		}(id, index)

		if waitCount == 5 || index == len(ids)-1 {
			// log.Println("Batch full..waiting for batch to finish..")
			wg.Wait()
			// log.Println("Starting next batch...")
			waitCount = 0
		}
	}
	log.Printf("Done fetching %d stories (%d expected)\n", len(newList.stories), len(ids))
	return newList.stories, nil
}

func updateStoryFileCache(s *story) error {
	filePath := filepath.Join(cacheDir, fmt.Sprintf(storyFilenameTemplate, s.ID))
	log.Println("Update story file cache", filePath)
	e, _ := fileExists(filePath)
	if !e {
		os.Create(filePath)
	}
	data := &storyCacheFile{
		CacheTime: time.Now(),
		Story:     s,
	}
	log.Println()
	b, err := json.Marshal(data)
	if err != nil {
		return err
	}
	err = ioutil.WriteFile(filePath, b, 0755)
	log.Printf("Done writing %s cache file\n", filePath)
	return err
}

func storyCacheFileIsUpToDate(storyID int64) (bool, *story, error) {
	cacheFile := filepath.Join(cacheDir, fmt.Sprintf(storyFilenameTemplate, storyID))
	cacheFileExits, err := fileExists(cacheFile)
	if err != nil {
		return false, nil, err
	}
	if !cacheFileExits {
		return false, nil, nil
	}
	f, err := os.Open(cacheFile)
	if err != nil {
		return false, nil, err
	}
	defer f.Close()
	d := json.NewDecoder(f)
	var s *storyCacheFile
	err = d.Decode(&s)
	if err != nil || s == nil || s.Story == nil {
		return false, nil, err
	}

	before := time.Now().Unix() - int64(60*60)
	t := s.CacheTime.Unix()
	if t < before {
		log.Printf("Story %d is too old in cache\n", s.Story.ID)
		return false, nil, nil
	}
	//log.Printf("Story %d is in cache and up to date\n", s.Story.ID)
	return true, s.Story, nil
}

func fetchStory(id int64) (*story, error) {
	url := fmt.Sprintf(storyURLTemplate, id)
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("Error fetch story details %s: %v", url, err)
	}
	d := json.NewDecoder(resp.Body)
	s := &story{}
	err = d.Decode(s)
	if err != nil {
		return nil, fmt.Errorf("Cannot parse JSON %s: %v", url, err)
	}
	return s, nil
}

func fetchStoryIDList(URL string) ([]int64, error) {
	resp, err := http.Get(URL)
	if err != nil {
		return nil, fmt.Errorf("Error fetching %s: %v", URL, err)
	}
	d := json.NewDecoder(resp.Body)
	IDs := make([]int64, 0)
	err = d.Decode(&IDs)
	if err != nil {
		return nil, fmt.Errorf("Cannot parse json for %s: %v", URL, err)
	}
	return IDs, nil
}

func createCacheDir() {
	os.MkdirAll(filepath.Join(cacheDir, "stories"), 0755)
}

func fileExists(file string) (bool, error) {
	_, err := os.Stat(file)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return true, err
}

type hnCache struct {
	mu   sync.RWMutex
	jobs []*story
	top  []*story
	new  []*story
	show []*story
	ask  []*story
}

type story struct {
	No          int        `json:"no,omitempty"`
	By          string     `json:"by"`
	ID          int        `json:"id"`
	Score       int        `json:"score"`
	Time        int64      `json:"time"`
	Title       string     `json:"title"`
	URL         string     `json:"url"`
	Descendants int        `json:"descendants"`
	Comments    []*comment `json:"comments,omitempty"`
	Domain      string     `json:"domain,omitempty"`
}

type comment struct {
	ID       int        `json:"id"`
	User     string     `json:"user"`
	Level    int        `json:"level"`
	TimeAgo  string     `json:"time_ago"`
	Content  string     `json:"content"`
	Comments []*comment `json:"comments"`
}
