package main

import (
    "encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"

	"crypto/md5"
	"encoding/hex"
	"strings"

	"github.com/gofiber/fiber/v2/middleware/limiter"
    "time"
	"github.com/gofiber/fiber/v2/middleware/cors"
	
)

func main(){

	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	// Ambil base URL dari ENV
	baseURL := os.Getenv("BASE_EXTERNAL_API_URL")
	if baseURL == "" {
		log.Fatal("EXTERNAL_API_BASE_URL not set in .env")
	}
	
	app := fiber.New(fiber.Config{
		Prefork:       true,
		CaseSensitive: true,
		StrictRouting: true,
		ServerHeader:  "Fiber",
		AppName: "Test App v1.0.1",
	});

	
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
	}))

	app.Static("/", "./react/dist")
    app.Static("/", "./react/dist/assets")

	app.Get("/fetch-data-saldo", limiter.New(limiter.Config{
		Max:        12,                // maksimal 10 request
		Expiration: 1 * time.Minute,   // dalam waktu 1 menit
		KeyGenerator: func(c *fiber.Ctx) string {
			// bisa batasi berdasarkan IP client misalnya
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Terlalu banyak request, coba lagi nanti.",
			})
		},
    }), func(c *fiber.Ctx) error {
		// URL dari pihak ketiga (ganti sesuai kebutuhan)
        fullURL := fmt.Sprintf("%s/cek-saldo", baseURL)
		// Buat HTTP GET request ke API eksternal
		
		apiSecret := os.Getenv("SECRET_API_KEY")
		username := os.Getenv("USERNAME")

		raw := username + apiSecret + "depo"
		hash := md5.Sum([]byte(raw))
		md5Str := hex.EncodeToString(hash[:])
		// Buat payload JSON secara dinamis
		payloadMap := map[string]string{
			"cmd":      "deposit",
			"username": username,
			"sign":     md5Str,
		}
		jsonBody, err := json.Marshal(payloadMap)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Gagal membuat JSON",
			})
		}

		// Buat request POST
		req, err := http.NewRequest("POST", fullURL, strings.NewReader(string(jsonBody)))
			if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Gagal membuat request POST",
			})
		}

		// Set header (optional)
		req.Header.Set("Content-Type", "application/json")

		// Kirim request
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Gagal mengirim request POST",
			})
		}
		defer resp.Body.Close()

		// Baca body response
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Gagal membaca response",
			})
		}

		// Decode response ke bentuk `interface{}` supaya fleksibel
		var data interface{}
		if err := json.Unmarshal(body, &data); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Gagal parsing JSON",
			})
		}

		// Kirim kembali data hasil fetch
		return c.JSON(data)
	})

	app.Get("/fetch-data-price-list", limiter.New(limiter.Config{
		Max:        20,                // maksimal 10 request
		Expiration: 1 * time.Minute,   // dalam waktu 1 menit
		KeyGenerator: func(c *fiber.Ctx) string {
			// bisa batasi berdasarkan IP client misalnya
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Terlalu banyak request, coba lagi nanti.",
			})
		},
    }), func(c *fiber.Ctx) error {
		// URL dari pihak ketiga (ganti sesuai kebutuhan)
        fullURL := fmt.Sprintf("%s/price-list", baseURL)
		// Buat HTTP GET request ke API eksternal
		
		apiSecret := os.Getenv("SECRET_API_KEY")
		username := os.Getenv("USERNAME")

		raw := username + apiSecret + "pricelist"
		hash := md5.Sum([]byte(raw))
		md5Str := hex.EncodeToString(hash[:])
		// Buat payload JSON secara dinamis
		payloadMap := map[string]string{
			"cmd":      "prepaid",
			"username": username,
			"sign":     md5Str,
		}
		jsonBody, err := json.Marshal(payloadMap)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Gagal membuat JSON",
			})
		}

		// Buat request POST
		req, err := http.NewRequest("POST", fullURL, strings.NewReader(string(jsonBody)))
			if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Gagal membuat request POST",
			})
		}

		// Set header (optional)
		req.Header.Set("Content-Type", "application/json")

		// Kirim request
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Gagal mengirim request POST",
			})
		}
		defer resp.Body.Close()

		// Baca body response
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Gagal membaca response",
			})
		}

		// Decode response ke bentuk `interface{}` supaya fleksibel
		var data interface{}
		if err := json.Unmarshal(body, &data); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Gagal parsing JSON",
			})
		}

		// Kirim kembali data hasil fetch
		return c.JSON(data)
	})


    log.Fatal(app.Listen(":3000"))
	// Custom config
	
// ...

}

