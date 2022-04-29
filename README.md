# BlackBird Website

This website aims to provide straightforward and convinent services based on the developed image processing pipeline.

### Requirements

#### Frontend

- [React](https://reactjs.org/)
- [Redux](https://redux.js.org/)

For other dependencies, please check out the `package.json` file

#### Backend

- [Pipenv](https://github.com/pypa/pipenv)
- [Python 3.6](https://www.python.org/)
- [Django](https://www.djangoproject.com/)
- [Django REST](https://www.django-rest-framework.org/)

For other dependencies, please check out the `requirements.txt` file

#### Deep Learning

- [PyTorch >= 1.4](https://pytorch.org/)
- [TorchVision](https://pypi.org/project/torchvision/)

### Running

#### Docker

When running the website using docker, you need to configure several files to make sure everything work normally.

```console
Frontend: In the .env.example file, configure the frontend API URL
Backend: In the bb_platform/.env_example, configure the backend parameters. 
         Remember to have the ALLOWED_HOSTS parameter set with '*', which means it allows request from any IP addresses
```

```Bash
git clone git@github.com:cu-cairlab/BB_platform.git
cd BB_platform
# Configure environment files then build
docker-compose build

# Without GPU
docker-compose up

# With GPU. Because docker-compose have not yet officially supported running containers with GPU devices, one has to run each service separately. 
# There are two shell scripts called "entry_point.sh" that can be used to start the containers. 
# You can configure the containers' behavior in these two files.

cd bb_platform
./entry_point.sh
cd frontend
./entry_point
```

### Deployment

We plan to deploy the platform using Docker and Nginx where Docker is used to run frontend and backend in two separated containers and Nginx is used to serve static webpages and reverse proxy. Specifically, the backend Docker container contains all the Django code that provides RESTful APIs. The frontend Docker container wraps up the React code that runs the static webpages as well as a Nginx service, which is used to serve the webpages. This Nginx service can be seen as a server simply. One point that is worth mentioning is that both backend and frontend have its own environment configuration files (e.g. `.env`), in which system-wise parameters are defined. That said, before running Dokcer containers, thses parameters needs to be taken care of.

In terms of the Nginx service that is running in the host machine, it is used to serve reverse proxies. In other words, this Nginx service is listening to the port 80 and passes the HTTP requests to different local servers according to the configuration file. Specifically, those requests whose URL starts with "/" will be redirected to the frontend container while ones whose URL starts with "/api" will be redirected to the backend container. Specially, requesting media or static files will be hanldled by the Nginx directly.

#### Reference

- [Docker Compose](https://docs.docker.com/compose/)
- [Nginx Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Nginx Serving Static Content](https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/)

#### Caveat

- Axios timeout mechanism
- Nginx proxy_pass trailing slash
- Django `.env` configuration
- React `.env` configuration
