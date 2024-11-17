**Quick start**
- Build docker image
```
./Docker/build-docker.sh
```


- run client
```
cd /client 
npm install
npm run dev
```
- Setup database
```
cd /server
npm install
cd /database/schema/ && ./main.sh
```
- run server
```
npm run dev
```

- watch server
```
npm run watch
```