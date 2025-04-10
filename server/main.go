package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type CertificateElement struct {
	ID           string  `json:"id" bson:"id"`
	Type         string  `json:"type" bson:"type"`
	Content      string  `json:"content" bson:"content"`
	X            float64 `json:"x" bson:"x"`
	Y            float64 `json:"y" bson:"y"`
	Width        float64 `json:"width,omitempty" bson:"width,omitempty"`
	Height       float64 `json:"height,omitempty" bson:"height,omitempty"`
	FontSize     float64 `json:"fontSize,omitempty" bson:"fontSize,omitempty"`
	Color        string  `json:"color,omitempty" bson:"color,omitempty"`
	FontFamily   string  `json:"fontFamily,omitempty" bson:"fontFamily,omitempty"`
	FontWeight   string  `json:"fontWeight,omitempty" bson:"fontWeight,omitempty"`
	ZIndex       int     `json:"zIndex" bson:"zIndex"`
	TextAlign    string  `json:"textAlign,omitempty" bson:"textAlign,omitempty"`
	BorderColor  string  `json:"borderColor,omitempty" bson:"borderColor,omitempty"`
	BorderWidth  float64 `json:"borderWidth,omitempty" bson:"borderWidth,omitempty"`
	BorderStyle  string  `json:"borderStyle,omitempty" bson:"borderStyle,omitempty"`
	BorderRadius float64 `json:"borderRadius,omitempty" bson:"borderRadius,omitempty"`
}

type Certificate struct {
	ID        primitive.ObjectID   `json:"id" bson:"_id,omitempty"`
	Name      string               `json:"name" bson:"name"`
	BgImage   string               `json:"bgImage" bson:"bgImage"`
	Elements  []CertificateElement `json:"elements" bson:"elements"`
	CreatedAt time.Time            `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time            `json:"updatedAt" bson:"updatedAt"`
}

var client *mongo.Client
var certificateCollection *mongo.Collection

func init() {
	// Initialize MongoDB connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Use environment variable for connection string
	const connectionString = "mongodb+srv://mayank2004:mayank2004@cluster0.faw0fgo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
	var err error
	client, err = mongo.Connect(ctx, options.Client().ApplyURI(connectionString))
	if err != nil {
		log.Fatal(err)
	}

	// Check the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	certificateCollection = client.Database("certificateMaker").Collection("certificates")

	// Create index on name field for faster queries
	indexModel := mongo.IndexModel{
		Keys: bson.M{"name": 1},
	}
	_, err = certificateCollection.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		log.Fatal("Error creating index:", err)
	}

	// Check if the collection is empty
	count, err := certificateCollection.CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Fatal("Error checking collection count:", err)
	}

	if count == 0 {
		insertDefaultCertificate(ctx)
	}
}

func insertDefaultCertificate(ctx context.Context) {
	fmt.Println("No certificates found, inserting default certificate...")

	defaultCertificate := Certificate{
		Name:    "Default Certificate",
		BgImage: "",
		Elements: []CertificateElement{
			{
				ID:           "title",
				Type:         "text",
				Content:      "CERTIFICATE OF ACHIEVEMENT",
				X:            400,
				Y:            100,
				FontSize:     36,
				Color:        "#2c3e50",
				FontFamily:   "Times New Roman",
				FontWeight:   "bold",
				ZIndex:       1,
				TextAlign:    "center",
				BorderColor:  "transparent",
				BorderWidth:  0,
				BorderStyle:  "solid",
				BorderRadius: 0,
			},
			{
				ID:           "recipient",
				Type:         "text",
				Content:      "This certificate is awarded to [Recipient Name]",
				X:            400,
				Y:            200,
				FontSize:     20,
				Color:        "#2c3e50",
				FontFamily:   "Times New Roman",
				ZIndex:       2,
				TextAlign:    "center",
				BorderColor:  "transparent",
				BorderWidth:  0,
				BorderStyle:  "solid",
				BorderRadius: 0,
			},
			{
				ID:           "description",
				Type:         "text",
				Content:      "For outstanding performance and dedication",
				X:            400,
				Y:            250,
				FontSize:     20,
				Color:        "#2c3e50",
				FontFamily:   "Times New Roman",
				ZIndex:       3,
				TextAlign:    "center",
				BorderColor:  "transparent",
				BorderWidth:  0,
				BorderStyle:  "solid",
				BorderRadius: 0,
			},
			{
				ID:           "date",
				Type:         "text",
				Content:      "Date: " + time.Now().Format("02/01/2006"),
				X:            400,
				Y:            350,
				FontSize:     18,
				Color:        "#2c3e50",
				FontFamily:   "Times New Roman",
				ZIndex:       4,
				TextAlign:    "center",
				BorderColor:  "transparent",
				BorderWidth:  0,
				BorderStyle:  "solid",
				BorderRadius: 0,
			},
			{
				ID:           "signature",
				Type:         "text",
				Content:      "Authorized Signature",
				X:            400,
				Y:            450,
				FontSize:     18,
				Color:        "#2c3e50",
				FontFamily:   "Times New Roman",
				ZIndex:       5,
				TextAlign:    "center",
				BorderColor:  "transparent",
				BorderWidth:  0,
				BorderStyle:  "solid",
				BorderRadius: 0,
			},
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err := certificateCollection.InsertOne(ctx, defaultCertificate)
	if err != nil {
		log.Fatal("Error inserting default certificate:", err)
	} else {
		fmt.Println("✅ Default certificate inserted successfully.")
	}
}

func main() {
	defer func() {
		if client != nil {
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()
			if err := client.Disconnect(ctx); err != nil {
				log.Printf("Error disconnecting from MongoDB: %v", err)
			}
		}
	}()

	// Register route handlers
	http.Handle("/api/certificates", corsMiddleware(http.HandlerFunc(handleCertificates)))
	http.Handle("/api/certificates/default", corsMiddleware(http.HandlerFunc(handleDefaultCertificate)))
	http.Handle("/api/certificates/save", corsMiddleware(http.HandlerFunc(handleSaveCertificate)))
	http.Handle("/api/certificates/load", corsMiddleware(http.HandlerFunc(handleLoadCertificate)))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server started on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := os.Getenv("ALLOWED_ORIGIN")
		if origin == "" {
			origin = "*"
		}
		
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func handleCertificates(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handleListCertificates(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleListCertificates(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{}
	if name := r.URL.Query().Get("name"); name != "" {
		filter["name"] = bson.M{"$regex": name, "$options": "i"}
	}

	opts := options.Find().SetSort(bson.M{"updatedAt": -1})

	cursor, err := certificateCollection.Find(ctx, filter, opts)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var certificates []Certificate
	if err = cursor.All(ctx, &certificates); err != nil {
		http.Error(w, "Error reading certificates: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(certificates); err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}

func handleDefaultCertificate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	defaultCertificate := Certificate{
		Name:    "Default Certificate",
		BgImage: "",
		Elements: []CertificateElement{
			{
				ID:           "title",
				Type:         "text",
				Content:      "CERTIFICATE OF ACHIEVEMENT",
				X:            400,
				Y:            100,
				FontSize:     36,
				Color:        "#2c3e50",
				FontFamily:   "Times New Roman",
				FontWeight:   "bold",
				ZIndex:       1,
				TextAlign:    "center",
				BorderColor:  "transparent",
				BorderWidth:  0,
				BorderStyle:  "solid",
				BorderRadius: 0,
			},
			{
				ID:           "recipient",
				Type:         "text",
				Content:      "This certificate is awarded to [Recipient Name]",
				X:            400,
				Y:            200,
				FontSize:     20,
				Color:        "#2c3e50",
				FontFamily:   "Times New Roman",
				ZIndex:       2,
				TextAlign:    "center",
				BorderColor:  "transparent",
				BorderWidth:  0,
				BorderStyle:  "solid",
				BorderRadius: 0,
			},
			{
				ID:           "description",
				Type:         "text",
				Content:      "For outstanding performance and dedication",
				X:            400,
				Y:            250,
				FontSize:     20,
				Color:        "#2c3e50",
				FontFamily:   "Times New Roman",
				ZIndex:       3,
				TextAlign:    "center",
				BorderColor:  "transparent",
				BorderWidth:  0,
				BorderStyle:  "solid",
				BorderRadius: 0,
			},
			{
				ID:           "date",
				Type:         "text",
				Content:      "Date: " + time.Now().Format("02/01/2006"),
				X:            400,
				Y:            350,
				FontSize:     18,
				Color:        "#2c3e50",
				FontFamily:   "Times New Roman",
				ZIndex:       4,
				TextAlign:    "center",
				BorderColor:  "transparent",
				BorderWidth:  0,
				BorderStyle:  "solid",
				BorderRadius: 0,
			},
			{
				ID:           "signature",
				Type:         "text",
				Content:      "Authorized Signature",
				X:            400,
				Y:            450,
				FontSize:     18,
				Color:        "#2c3e50",
				FontFamily:   "Times New Roman",
				ZIndex:       5,
				TextAlign:    "center",
				BorderColor:  "transparent",
				BorderWidth:  0,
				BorderStyle:  "solid",
				BorderRadius: 0,
			},
		},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(defaultCertificate); err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}

func handleSaveCertificate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var cert Certificate
	if err := json.NewDecoder(r.Body).Decode(&cert); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate required fields
	if cert.Name == "" {
		http.Error(w, "Certificate name is required", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cert.UpdatedAt = time.Now()

	var result *mongo.InsertOneResult
	var err error
	var operation string

	if cert.ID.IsZero() {
		// New certificate
		cert.CreatedAt = time.Now()
		result, err = certificateCollection.InsertOne(ctx, cert)
		operation = "insert"
	} else {
		// Update existing certificate
		update := bson.M{
			"$set": bson.M{
				"name":      cert.Name,
				"bgImage":   cert.BgImage,
				"elements":  cert.Elements,
				"updatedAt": cert.UpdatedAt,
			},
		}
		_, err = certificateCollection.UpdateByID(ctx, cert.ID, update)
		operation = "update"
	}

	if err != nil {
		log.Printf("Error during %s operation: %v", operation, err)
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if result != nil {
		if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
			cert.ID = oid
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(cert); err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}

func handleLoadCertificate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "ID parameter is required", http.StatusBadRequest)
		return
	}

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid ID format: "+err.Error(), http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var cert Certificate
	err = certificateCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&cert)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Certificate not found", http.StatusNotFound)
		} else {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(cert); err != nil {
		log.Printf("Error encoding response: %v", err)
	}
}