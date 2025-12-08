from locust import HttpUser, task, between

class ClubAlmacenUser(HttpUser):
    # Simulamos usuarios reales: leen un poco, hacen click, leen otro poco.
    # Esperan entre 2 y 5 segundos entre cada acción.
    wait_time = between(2, 5)

    # --- GRUPO A: CONTENIDO RÁPIDO (Noticias y Blog) ---
    # Alta probabilidad (weight=4) porque es lo primero que ven en el Home
    @task(4)
    def ver_noticias(self):
        self.client.get("/api/news", name="GET /news (RSS)")

    @task(3)
    def ver_muro_oficial(self):
        self.client.get("/api/blog", name="GET /blog (Muro)")

    # --- GRUPO B: DIRECTORIOS (Carga sobre colección Users) ---
    # Esto prueba si tu BD aguanta filtrar usuarios por rol
    @task(2)
    def buscar_proveedores(self):
        self.client.get("/api/users/public/providers", name="GET /providers")

    @task(2)
    def buscar_locatarios(self):
        self.client.get("/api/users/public/locatarios", name="GET /locatarios")

    # --- GRUPO C: COMUNIDAD Y MERCADO ---
    @task(3)
    def ver_foro(self):
        # Ver el foro implica traer posts + autores + categorías (Populate)
        self.client.get("/api/posts", name="GET /posts")

    @task(2)
    def ver_catalogo(self):
        self.client.get("/api/products", name="GET /products")
    
    @task(1)
    def ver_categorias(self):
        self.client.get("/api/categories", name="GET /categories")