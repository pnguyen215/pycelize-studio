# Use `pnpm`

```bash
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build
COPY --from=builder /app/pnpm-lock.yaml* ./
CMD ["pnpm", "start"]
```

---

# Use `npm`

```bash
COPY package.json package-lock.json* ./
RUN npm ci
RUN npm run build
COPY --from=builder /app/package-lock.json* ./
CMD ["npm", "run", "start"]
```
