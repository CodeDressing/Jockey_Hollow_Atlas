FROM node:24-bookworm-slim AS build
WORKDIR /source
COPY . .
RUN node atlas_access/prepare.cjs /collection

FROM python:3.13-slim-bookworm
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY atlas_access/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt && useradd --uid 10001 --create-home atlas
COPY atlas_access/app.py atlas_access/storage.py ./
COPY atlas_access/templates/ ./templates/
COPY atlas_access/static/ ./static/
COPY --from=build /collection/ ./collection/
USER atlas
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "--workers", "2", "--threads", "2", "app:from_env()"]
