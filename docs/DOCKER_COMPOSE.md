# Frontend

```yaml
version: "3.9"

services:
  pycelize-studio:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: pycelize-studio
    ports:
      - "3000:3000"
    environment:
      # Example: URL to backend pycelize API
      # Adjust this to point to your actual Flask backend
      NEXT_PUBLIC_PYCELIZE_API_URL: "http://localhost:5050"
      NODE_ENV: "production"
    restart: unless-stopped
```

---

# Frontend with Backend

```yml
version: "3.9"

services:
  pycelize-api:
    image: pycelize:latest
    # build:
    #   context: ../pycelize
    #   dockerfile: Dockerfile
    container_name: pycelize-api
    ports:
      - "5050:5050"
    environment:
      FLASK_ENV: "production"
    restart: unless-stopped

  pycelize-studio:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: pycelize-studio
    depends_on:
      - pycelize-api
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_PYCELIZE_API_URL: "http://pycelize-api:5050"
      NODE_ENV: "production"
    restart: unless-stopped
```
