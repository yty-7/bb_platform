docker run --rm --gpus device=1 -p 8080:8080 --name back \
        -v /home/tq42/BB_platform/bb_platform/bb_platform/.env_example:/app/bb_platform/.env \
        -v /media/cornell/Data/tq42/bb_platform_data:/app/media \
        -v /media/cornell/Data/tq42/db.sqlite3:/app/db.sqlite3 \
        bb_platform_back:latest gunicorn bb_platform.wsgi --bind 0.0.0.0:8080 --log-level debug


# docker start web_v1
# docker exec -d web_v1 python manage.py runserver 0.0.0.0:8000