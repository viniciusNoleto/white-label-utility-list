include .env

MAKEFLAGS += --no-print-directory

DOCKERFILE := docker-compose.${APP_ENV}.yml
APP_NAME := white-label-utility-list-front
SERVER_NAME := white-label-utility-list-server

f :=
art:
	@cat configs/scripts/arts/${f}.txt
	@echo

echo-system:
	@make art f=system

echo-buda:
	@make art f=buda

build:
	@docker compose -f $(DOCKERFILE) build --no-cache

build-cache:
	@docker compose -f $(DOCKERFILE) build

install-deps:
	@docker compose -f $(DOCKERFILE) run --rm $(APP_NAME) npm install

db-migrate:
	@docker compose -f $(DOCKERFILE) exec $(APP_NAME) npm run db:migrate

db-seed:
	@docker compose -f $(DOCKERFILE) exec $(APP_NAME) npm run db:seed

logs:
	@docker logs $(APP_NAME)

watch:
	@docker compose -f $(DOCKERFILE) up

clear-up:
	@docker compose -f $(DOCKERFILE) up -d

up:
	@make clear-up
	@make echo-system

down:
	@docker compose -f $(DOCKERFILE) down

restart:
	@make down
	@make up

update-build:
	@docker compose -f $(DOCKERFILE) build $(APP_NAME)
	@docker compose -f $(DOCKERFILE) up -d --no-deps $(APP_NAME)

c :=
exec:
	@docker compose -f $(DOCKERFILE) exec $(APP_NAME) $(c)

in-front:
	@docker compose -f $(DOCKERFILE) exec -it white-label-utility-list-front /bin/sh

lint:
	@make exec c="npm run lint"

logs-server:
	@docker logs $(SERVER_NAME)

d :=
certbot:
	@docker compose -f $(DOCKERFILE) exec $(SERVER_NAME) certbot --nginx -d $(d)

certbot-renew:
	@docker compose -f $(DOCKERFILE) exec $(SERVER_NAME) certbot renew --nginx

nginx-reload:
	@docker compose -f $(DOCKERFILE) exec $(SERVER_NAME) nginx -s reload

s :=
t :=
m :=
step:
	@echo
	@echo "█▓▒░ \033[38;2;255;196;12m[$(s)/$(t)]\033[0m $(m)"
	@echo

last-step:
	@echo
	@echo "░▒▓█ \033[38;2;22;198;12mWhite Label Utility List\033[0m working!!!"
	@echo
	@make echo-buda
	@echo "\033[38;2;170;0;255m🞮\033[0m Vinícius Nolêto"
	@echo "\033[38;2;170;0;255m🞉\033[0m GitHub: \033[38;2;88;166;255mhttps://github.com/viniciusNoleto\033[0m"
	@echo "\033[38;2;170;0;255m🞉\033[0m LinkedIn: \033[38;2;88;166;255mhttps://www.linkedin.com/in/vin%C3%ADcius-nol%C3%AAto-de-ara%C3%BAjo\033[0m"
	@echo

install:
	@make echo-system
	@make step s=1 t=5 m="Building the Docker image..."
	@make build
	@make step s=2 t=5 m="Installing dependencies (npm install)..."
	@make install-deps
	@make step s=3 t=5 m="Starting the containers..."
	@make clear-up
	@make step s=4 t=5 m="Running database migrations..."
	@make db-migrate
	@make step s=5 t=6 m="Running database seeds..."
	@make db-seed
	@make step s=6 t=6 m="Finishing installation..."
	@make last-step
