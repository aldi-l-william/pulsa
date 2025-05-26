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

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	jwtware "github.com/gofiber/jwt/v3"
    "github.com/golang-jwt/jwt/v5"
	
)



// Model
type Invoice struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	Ref_ID          string    `json:"ref_id"`
	Buyer_SKU_Code  string    `json:"buyer_sku_code"`
	Customer_number string    `json:"customer_number"`
	CreatedAt       time.Time
}

func (i *Invoice) BeforeCreate(tx *gorm.DB) (err error) {
	today := time.Now().Format("2006-01-02") // Contoh: 2025-05-26

	var count int64
	tx.Model(&Invoice{}).
		Where("date(created_at) = date(?)", today).
		Count(&count)

	seq := count + 1
	refID := fmt.Sprintf("INV%s-%03d", today, seq)
	i.Ref_ID = refID

	return nil
}

var jwtSecret []byte
func main(){

	db, err := gorm.Open(sqlite.Open("mypulsa.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Auto-migrate untuk membuat tabel jika belum ada
	db.AutoMigrate(&Invoice{})


	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	jwtSecret = []byte(os.Getenv("JWT_SECRET_KEY"))
	if len(jwtSecret) == 0 {
		log.Fatal("JWT_SECRET_KEY not found in .env")
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
        AllowOrigins:     "https://mypulsa.my.id, http://localhost:5173",
        AllowMethods:     "GET,POST,OPTIONS",
        AllowHeaders:     "Content-Type,Authorization",
        AllowCredentials: true,
    }))

	protected := app.Group("/protected")

	protected.Use(jwtware.New(jwtware.Config{
		SigningKey: jwtSecret,
		TokenLookup: "header:Authorization",
	}))

	protected.GET("/fetch-data-saldo", limiter.New(limiter.Config{
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

	protected.GET("/fetch-data-price-list", limiter.New(limiter.Config{
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

	protected.Post("/buy-prepaid", func(c *fiber.Ctx) error {

		var input struct {
			Buyer_SKU_Code  string `json:"buyer_sku_code"`
			Customer_number string `json:"customer_number"`
		}

		if err := c.BodyParser(&input); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}

		// STEP 2: Buat invoice dari input client
		invoice := Invoice{
			Buyer_SKU_Code:  input.Buyer_SKU_Code,
			Customer_number: input.Customer_number,
		}

		if err := db.Create(&invoice).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Gagal menyimpan invoice",
			})
		}

        fmt.Println("Ref ID:", invoice.Ref_ID)

		fullURL := fmt.Sprintf("%s/transaction", baseURL)
		apiSecret := os.Getenv("SECRET_API_KEY")
		username := os.Getenv("USERNAME")

		raw := username + apiSecret + invoice.Ref_ID
		hash := md5.Sum([]byte(raw))
		md5Str := hex.EncodeToString(hash[:])

		// Buat payload JSON secara dinamis
		payloadMap := map[string]interface{}{
			"username": username,
			"sign":     md5Str,
			"buyer_sku_code": input.Buyer_SKU_Code,
			"customer_no": input.Customer_number,
			"ref_id": invoice.Ref_ID,
			"testing": true,
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
		// return c.JSON(data)// e.g. INV2025-05-26-001

		return c.JSON(fiber.Map{
			"message": "Pembelian berhasil dikirim",
			"ref_id":  invoice.Ref_ID,
			"result":    data,
		})

	})

	app.Post("/login", func(c *fiber.Ctx) error {
	type LoginInput struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	var input LoginInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Dummy auth
	if input.Username != "admin" || input.Password != "P@ssw0rd0777..." {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": input.Username,
		"exp":      time.Now().Add(time.Hour * 1).Unix(),
	})

	t, err := token.SignedString(jwtSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Token error"})
	}

	   return c.JSON(fiber.Map{"token": t})
    })



    log.Fatal(app.Listen(":3000"))
	// Custom config
	
// ...

}




