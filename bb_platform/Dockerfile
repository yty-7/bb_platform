FROM nvidia/cuda:10.2-cudnn7-devel

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get install -y \
    python3-opencv ca-certificates python3-dev python3-pip git wget sudo  \
    cmake ninja-build && \
    rm -rf /var/lib/apt/lists/* && \
    ln -sv /usr/bin/python3 /usr/bin/python && ln -sv /usr/bin/pip3 /usr/bin/pip

WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt
COPY . .

RUN mv bb_platform/.env_example bb_platform/.env
RUN python manage.py migrate
# set FORCE_CUDA because during `docker build` cuda is not accessible
ENV FORCE_CUDA="1"

EXPOSE 8080
# to run gunicorn command
ENV PATH="/root/.local/bin:${PATH}"
CMD ["gunicorn", "bb_platform.wsgi", "--bind", "0.0.0.0:8080"]
