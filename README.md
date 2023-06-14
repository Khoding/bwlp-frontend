# bwLehrpool

The Angular Client was generated with the Angular CLI in version 8.3.9.

### Starting the client
To start the client all dependencies need to be installed first. Navigate to the `bwlp-frontend-main` directory and execute
```commandline
npm install
```

To start the client once setup is complete and open it in your default browser:
```commandline
ng serve --open
```
It serves on `http://localhost:4200`.

Once logged in you will have to select a satellite server. Choose the `Uni Freiburg (UB, Rechenzentrum, KG2, etc.)` server, as it supports the required thrift interface. It's currently missing a valid certificate, so it will probably be necessary to go to `https://132.230.4.2/thrift/` manually and add an exception.

### About this project
This is a prototype for a Webapp for the [bwLehrpool Suite](https://www.bwlehrpool.de/wiki/doku.php/client/bwlehrpool-suite), a tool for managing the VMs used in the bwLehrpool system. It is based on the LehrpoolNRW project.