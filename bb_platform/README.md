# BlackBird Platform Django Backend

### Installation

- Without Docker

```Bash
git clone git@github.com:cu-cairlab/BB_platform.git
cd BB_platform
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd bb_platform
./manage.py migrate
./manage.py createsuperuser
```

Run server

`./manage.py runserver`

Visit website

[http://127.0.0.1:8000](http://127.0.0.1:8000)

Visit admin website

[http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)

### Configuration

Remember to create a `.env` file under the **bb_platform** direcotry and put all system configurations into that file so that the system works normally.
